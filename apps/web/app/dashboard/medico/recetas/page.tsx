"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@red-salud/ui";
import {
  Pill,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Printer,
  Download,
  Filter,
  Calendar,
  User,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Settings,
} from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { getDoctorPrescriptions } from "@/lib/supabase/services/medications-service";
import { supabase } from "@/lib/supabase/client";
import { Prescription } from "@/lib/supabase/types/medications";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@red-salud/core/utils";

export default function RecipesListPage() {
  const [recipes, setRecipes] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    getUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function fetchRecipes() {
      setIsLoading(true);
      try {
        const { success, data } = await getDoctorPrescriptions(userId!);
        if (success) {
          setRecipes(data);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecipes();
  }, [userId]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const patientName = recipe.paciente?.nombre_completo?.toLowerCase() || "";
      const diagnosis = recipe.diagnostico?.toLowerCase() || "";
      const searchLower = searchQuery.toLowerCase();
      return patientName.includes(searchLower) || diagnosis.includes(searchLower);
    });
  }, [recipes, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "surtida":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Surtida
          </Badge>
        );
      case "activa":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Clock className="h-3 w-3" /> Activa
          </Badge>
        );
      case "vencida":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <Clock className="h-3 w-3" /> Vencida
          </Badge>
        );
      case "cancelada":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <XCircle className="h-3 w-3" /> Cancelada
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg shadow-emerald-500/20 shadow-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              Recetas Médicas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y realiza seguimiento a las prescripciones de tus pacientes
            </p>
          </div>
          <Link href="/dashboard/medico/recetas/nueva">
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 group">
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
              Nueva Receta
            </Button>
          </Link>
          <Link href="/dashboard/medico/recetas/configuracion">
            <Button variant="outline" size="icon" title="Configurar Recetas">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <Card className="border-none shadow-md bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente o diagnóstico..."
                className="pl-9 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" title="Filtrar">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" title="Calendario">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* List Table */}
        <Card className="overflow-hidden border-none shadow-xl">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableHead className="w-[300px]">Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                      <p className="text-muted-foreground">Cargando recetas...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <TableRow key={recipe.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-sm">
                          <AvatarImage src={recipe.paciente?.avatar_url} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                            {recipe.paciente?.nombre_completo?.charAt(0) || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 italic group-hover:not-italic">
                            {recipe.paciente?.nombre_completo || "Paciente desconocido"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {recipe.paciente?.cedula || "Sin cédula"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {format(new Date(recipe.fecha_prescripcion), "d 'de' MMM, yyyy", { locale: es })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(recipe.created_at), "HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm line-clamp-1 max-w-[200px]" title={recipe.diagnostico}>
                        {recipe.diagnostico || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(recipe.status || "activa")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-100">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" /> Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Printer className="h-4 w-4" /> Imprimir
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Download className="h-4 w-4" /> Descargar PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 gap-2">
                              <XCircle className="h-4 w-4" /> Cancelar Receta
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                        <Pill className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">No hay recetas</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                          {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : "Aún no has creado ninguna receta médica."}
                        </p>
                      </div>
                      <Link href="/dashboard/medico/recetas/nueva">
                        <Button variant="outline" className="mt-2">
                          <Plus className="mr-2 h-4 w-4" /> Crear mi primera receta
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Quick Stats - Premium Touch */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden relative group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Clock className="h-24 w-24" />
            </div>
            <CardContent className="p-6">
              <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">Recetas Activas</p>
              <h4 className="text-3xl font-bold mt-2">{recipes.filter(r => r.status === 'activa').length}</h4>
              <p className="text-xs text-muted-foreground mt-1">Pendientes por surtir en farmacia</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-100 dark:border-emerald-900 shadow-sm overflow-hidden relative group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-24 w-24" />
            </div>
            <CardContent className="p-6">
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wider">Recetas Surtidas</p>
              <h4 className="text-3xl font-bold mt-2">{recipes.filter(r => r.status === 'surtida').length}</h4>
              <p className="text-xs text-muted-foreground mt-1">Completadas exitosamente</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-100 dark:border-purple-900 shadow-sm overflow-hidden relative group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Plus className="h-24 w-24" />
            </div>
            <CardContent className="p-6">
              <p className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">Total Histórico</p>
              <h4 className="text-3xl font-bold mt-2">{recipes.length}</h4>
              <p className="text-xs text-muted-foreground mt-1">Prescripciones realizadas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </VerificationGuard>
  );
}
