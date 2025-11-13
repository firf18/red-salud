import React, { useEffect, useMemo } from 'react';
import { Animated } from 'react-native';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  variant = 'rectangular',
  className = '',
}: SkeletonProps) {
  // Evitar acceder a refs durante el render: memoizamos el Animated.Value una sola vez.
  const opacity = useMemo(() => new Animated.Value(0.3), []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  const borderRadius =
    variant === 'circular'
      ? 9999
      : variant === 'text'
      ? 4
      : 8;

  return (
    <Animated.View
      style={{
        width,
        height,
        backgroundColor: '#E5E7EB',
        borderRadius,
        opacity,
      }}
      className={className}
    />
  );
}
