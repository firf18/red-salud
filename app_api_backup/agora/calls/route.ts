import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// AGORA CALLS API ROUTE
// Crea sesiones de llamada de voz/video
// ============================================================================

import { supabase } from '@/lib/supabase/client';
import { generateRTCToken, RtcRole } from '@/lib/agora/utils/token-generator';

// ============================================================================
// TYPES
// ============================================================================

interface CreateCallRequest {
  recipientId: string;
  callType: 'audio' | 'video';
  channelId?: string;
}

interface CreateCallResponse {
  success: boolean;
  data?: {
    callId: string;
    roomId: string;
    channelName: string;
    token: string;
    uid: number;
  };
  error?: string;
}

// ============================================================================
// POST /api/agora/calls - Crear una nueva llamada
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateCallRequest;
    const { recipientId, callType, channelId } = body;

    // Obtener usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validar parámetros requeridos
    if (!recipientId) {
      return NextResponse.json(
        { error: 'recipientId is required' },
        { status: 400 }
      );
    }

    if (!callType || !['audio', 'video'].includes(callType)) {
      return NextResponse.json(
        { error: 'callType must be "audio" or "video"' },
        { status: 400 }
      );
    }

    // Generar nombre único para la sala
    const roomName = `call_${user.id}_${recipientId}_${Date.now()}`;
    const uid = Date.now();

    // Generar token RTC
    const token = generateRTCToken(
      process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
      process.env.AGORA_APP_CERTIFICATE || '',
      roomName,
      uid,
      RtcRole.PUBLISHER,
      3600 // 1 hora
    );

    // Crear registro en chat_voice_calls si hay channelId
    let callData = null;
    if (channelId) {
      const { data: call, error: callError } = await supabase
        .from('chat_voice_calls')
        .insert({
          channel_id: channelId,
          initiated_by: user.id,
          call_type: callType,
          status: 'ringing',
          room_id: roomName,
          service_provider: 'agora',
        })
        .select()
        .single();

      if (!callError && call) {
        callData = call;

        // Crear notificación de llamada entrante para el destinatario
        await supabase.from('chat_notifications').insert({
          user_id: recipientId,
          type: 'call_incoming',
          title: 'Llamada entrante',
          body: `${user.user_metadata?.nombre_completo || 'Alguien'} te está llamando`,
          data: {
            call_id: call.id,
            call_type: callType,
            channel_id: channelId,
            caller_id: user.id,
            caller_name: user.user_metadata?.nombre_completo || 'Alguien',
            room_name: roomName,
            token,
            uid,
          },
        });
      }
    }

    return NextResponse.json<CreateCallResponse>({
      success: true,
      data: {
        callId: callData?.id || '',
        roomId: roomName,
        channelName: roomName,
        token,
        uid,
      },
    });
  } catch (error) {
    console.error('Error creating call:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create call',
      },
      { status: 500 }
    );
  }
}
