"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  useSession,
  useActiveSession,
  useSessionParticipants,
  useSessionChat,
} from "@/hooks/use-telemedicine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  FileText,
  User,
  Calendar,
  Clock,
  Send,
  ArrowLeft,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [userId, setUserId] = useState<string | undefined>();
  const [userName, setUserName] = useState<string>("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");

  const { session, loading, refreshSession } = useSession(sessionId);
  const { start, end, update } = useActiveSession(sessionId);
  const { participants, join, leave } = useSessionParticipants(sessionId);
  const { messages, send, markAsRead, refreshMessages } = useSessionChat(sessionId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Obtener nombre del usuario
        const { data: profile } = await supabase
          .from("profiles")
          .select("nombre_completo")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setUserName(profile.nombre_completo);
        }
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simular acceso a cámara y micrófono
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    if (session?.status === "active" || session?.status === "waiting") {
      initMedia();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [session?.status]);

  const handleStartSession = async () => {
    if (!userId) return;

    // Unirse como participante
    await join(userId, {
      session_id: sessionId,
      role: "patient",
      video_enabled: isVideoEnabled,
      audio_enabled: isAudioEnabled,
    });

    // Iniciar sesión
    await start();
    await refreshSession();
  };

  const handleEndSession = async () => {
    await end(sessionNotes);
    await refreshSession();
    router.push("/dashboard/paciente/telemedicina");
  };

  const handleSendMessage = async () => {
    if (!userId || !messageText.trim()) return;

    await send(userId, {
      session_id: sessionId,
      message: messageText,
      message_type: "text",
    });

    setMessageText("");
    await refreshMessages();
  };

  const toggleVideo = async () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  const toggleAudio = async () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
    }
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // Aquí iría la lógica real de compartir pantalla
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Sesión no encontrada</p>
            <Button onClick={() => router.push("/dashboard/paciente/telemedicina")}>
              Volver a Telemedicina
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = session.status === "active";
  const isWaiting = session.status === "waiting";
  const canStart = session.status === "scheduled" || session.status === "waiting";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/paciente/telemedicina")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive && "En Curso"}
            {isWaiting && "En Espera"}
            {session.status === "scheduled" && "Programada"}
            {session.status === "completed" && "Completada"}
            {session.status === "cancelled" && "Cancelada"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Video Principal */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="relative bg-gray-900 aspect-video">
                {isActive || isWaiting ? (
                  <>
                    {/* Video remoto (doctor) */}
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Video local (paciente) - Picture in Picture */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {!isVideoEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Información del doctor */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                      <p className="text-white font-semibold">
                        Dr. {session.doctor?.nombre_completo}
                      </p>
                      <p className="text-white/80 text-sm">
                        {session.doctor?.specialty || "Medicina General"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">
                        {session.status === "completed"
                          ? "Sesión finalizada"
                          : "La sesión aún no ha comenzado"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controles de video */}
              {(isActive || isWaiting) && (
                <div className="bg-gray-800 p-4">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant={isVideoEnabled ? "secondary" : "destructive"}
                      size="lg"
                      onClick={toggleVideo}
                      className="rounded-full h-14 w-14"
                    >
                      {isVideoEnabled ? (
                        <Video className="h-6 w-6" />
                      ) : (
                        <VideoOff className="h-6 w-6" />
                      )}
                    </Button>

                    <Button
                      variant={isAudioEnabled ? "secondary" : "destructive"}
                      size="lg"
                      onClick={toggleAudio}
                      className="rounded-full h-14 w-14"
                    >
                      {isAudioEnabled ? (
                        <Mic className="h-6 w-6" />
                      ) : (
                        <MicOff className="h-6 w-6" />
                      )}
                    </Button>

                    <Button
                      variant={isScreenSharing ? "default" : "secondary"}
                      size="lg"
                      onClick={toggleScreenShare}
                      className="rounded-full h-14 w-14"
                    >
                      {isScreenSharing ? (
                        <Monitor className="h-6 w-6" />
                      ) : (
                        <MonitorOff className="h-6 w-6" />
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleEndSession}
                      className="rounded-full h-14 w-14"
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Botón para iniciar */}
              {canStart && (
                <div className="p-6 text-center">
                  <Button
                    onClick={handleStartSession}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Iniciar Consulta
                  </Button>
                </div>
              )}
            </Card>

            {/* Información de la sesión */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Consulta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {new Date(session.scheduled_start_time).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{formatTime(session.scheduled_start_time)}</span>
                  </div>
                </div>

                {session.appointment?.reason && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Motivo de consulta:
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.appointment.reason}
                    </p>
                  </div>
                )}

                {session.duration_minutes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Duración:
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.duration_minutes} minutos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral */}
          <div className="space-y-4">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="h-4 w-4 mr-2" />
                  Notas
                </TabsTrigger>
              </TabsList>

              {/* Chat */}
              <TabsContent value="chat" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Chat de la Consulta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const isOwn = msg.sender_id === userId;
                          return (
                            <div
                              key={msg.id}
                              className={cn(
                                "flex",
                                isOwn ? "justify-end" : "justify-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[80%] rounded-lg px-4 py-2",
                                  isOwn
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-900"
                                )}
                              >
                                {!isOwn && (
                                  <p className="text-xs font-semibold mb-1">
                                    {msg.sender?.nombre_completo || "Doctor"}
                                  </p>
                                )}
                                <p className="text-sm">{msg.message}</p>
                                <p
                                  className={cn(
                                    "text-xs mt-1",
                                    isOwn ? "text-blue-100" : "text-gray-500"
                                  )}
                                >
                                  {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {(isActive || isWaiting) && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Escribe un mensaje..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage} size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notas */}
              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notas de la Sesión</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Escribe tus notas aquí..."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      rows={15}
                      className="resize-none"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Participantes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Participantes ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {participant.role === "patient" ? userName : `Dr. ${session.doctor?.nombre_completo}`}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {participant.role === "patient" ? "Paciente" : "Doctor"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          participant.connection_status === "connected"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {participant.connection_status === "connected"
                          ? "Conectado"
                          : "Desconectado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
