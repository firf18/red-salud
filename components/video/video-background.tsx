"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface VideoBackgroundProps {
  src: string;
  overlay?: boolean;
  overlayOpacity?: number;
  className?: string;
  enableParallax?: boolean;
}

/**
 * Componente optimizado para video de fondo con overlay y efectos
 * @param src - Ruta del video
 * @param overlay - Mostrar capa de overlay oscuro
 * @param overlayOpacity - Opacidad del overlay (0-1)
 * @param className - Clases CSS adicionales
 * @param enableParallax - Habilitar efecto parallax
 */
export function VideoBackground({
  src,
  overlay = true,
  overlayOpacity = 0.6,
  className = "",
  enableParallax = false,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoaded(true);
      video.play().catch((err) => {
        console.warn("Error al reproducir video:", err);
      });
    };

    video.addEventListener("loadeddata", handleLoadedData);

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Video */}
      <motion.video
        ref={videoRef}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover"
        style={{
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.1,
          y: enableParallax ? [0, -20, 0] : 0,
        }}
        transition={{
          opacity: { duration: 1 },
          scale: { duration: 1.2 },
          y: enableParallax
            ? {
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }
            : {},
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </motion.video>

      {/* Overlay */}
      {overlay && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-teal-900/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: overlayOpacity }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Patrón de puntos decorativo */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
