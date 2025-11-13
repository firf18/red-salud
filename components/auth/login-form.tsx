"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { signIn, signOut } from "@/lib/supabase/auth";
import { useRateLimit } from "@/hooks/auth/use-rate-limit";
import { useOAuthErrors } from "@/hooks/auth/use-oauth-errors";
import { useOAuthSignIn } from "@/hooks/auth/use-oauth-signin";
import { RememberMeCheckbox } from "@/components/auth/remember-me-checkbox";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { validateUserRole } from "@/lib/auth/role-validator";
import { type UserRole } from "@/lib/constants";
import { sessionManager } from "@/lib/security/session-manager";

interface LoginFormProps {
  role: UserRole;
  roleLabel: string;
}

function LoginFormContent({ role, roleLabel }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Hooks personalizados
  const { checkRateLimit, recordFailedAttempt, resetAttempts } = useRateLimit();
  const { signInWithGoogle, isLoading: isOAuthLoading } = useOAuthSignIn({
    role,
    mode: "login",
    onError: setError,
  });
  useOAuthErrors(setError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const rateLimitCheck = checkRateLimit();
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.message!);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await signIn(data);

    if (!result.success || !result.user) {
      recordFailedAttempt();
      setError(result.error || "Error al iniciar sesión");
      setIsLoading(false);
      return;
    }

    resetAttempts();
    const userRole = result.user.user_metadata?.role || "paciente";
    
    // Validar que el rol del usuario coincida con el rol de la página
    const validation = validateUserRole(userRole, role);
    if (!validation.isValid) {
      setError(validation.errorMessage!);
      setIsLoading(false);
      // Cerrar sesión automáticamente
      await signOut();
      return;
    }
    
    // Configurar sesión con preferencias de seguridad
    await sessionManager.setupSession({
      rememberMe,
      role: userRole,
      deviceFingerprint: await getDeviceFingerprint(),
    });
    
    router.push(`/dashboard/${userRole}`);
  };

  const getDeviceFingerprint = async (): Promise<string> => {
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
    ].join("|");
    return btoa(data);
  };



  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-white to-blue-50/50 relative">
      {/* Botón de regresar - Posición absoluta */}
      <Link
        href="/login"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:-translate-x-1 transition-transform"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        <span className="text-sm font-medium">Cambiar tipo de cuenta</span>
      </Link>

      {/* Contenedor centrado */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Título */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600">
              Acceso para <span className="font-semibold text-blue-600">{roleLabel}</span>
            </p>
          </div>

          {/* Card del formulario */}
          <Card className="border-2 shadow-xl bg-white">
            <CardContent className="px-6 py-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OAuth Google */}
              <div className="mb-6 flex justify-center">
                <GoogleSignInButton
                  onClick={signInWithGoogle}
                  disabled={isLoading || isOAuthLoading}
                  mode="login"
                />
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    O con tu email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10"
                      {...register("email")}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...register("password")}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <RememberMeCheckbox
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  role={role}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link
                  href={`/register/${role}`}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Regístrate aquí
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>
    </div>
  );
}

export function LoginForm(props: LoginFormProps) {
  return (
    <Suspense fallback={
      <div className="h-screen bg-linear-to-br from-blue-50/30 via-white to-blue-50/50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <LoginFormContent {...props} />
    </Suspense>
  );
}
