import { useState, useCallback } from "react";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

export function useRateLimit() {
  const [error, setError] = useState<string | null>(null);

  const checkRateLimit = useCallback(() => {
    const attempts = parseInt(localStorage.getItem("login_attempts") || "0");
    const lockoutUntil = parseInt(localStorage.getItem("lockout_until") || "0");

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
      const message = `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} minuto${minutesLeft > 1 ? "s" : ""}.`;
      setError(message);
      return { allowed: false, message };
    }

    setError(null);
    return { allowed: true };
  }, []);

  const recordFailedAttempt = useCallback(() => {
    const attempts = parseInt(localStorage.getItem("login_attempts") || "0") + 1;
    localStorage.setItem("login_attempts", attempts.toString());

    if (attempts >= MAX_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION;
      localStorage.setItem("lockout_until", lockoutUntil.toString());
      setError(
        "Demasiados intentos fallidos. Tu cuenta ha sido bloqueada temporalmente por 15 minutos."
      );
    }
  }, []);

  const resetAttempts = useCallback(() => {
    localStorage.removeItem("login_attempts");
    localStorage.removeItem("lockout_until");
    setError(null);
  }, []);

  return {
    error,
    setError,
    checkRateLimit,
    recordFailedAttempt,
    resetAttempts,
  };
}
