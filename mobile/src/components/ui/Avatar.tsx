import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';

interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const textSizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export function Avatar({ source, size = 'md', fallback, className = '' }: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <View
      className={`${sizeStyles[size]} rounded-full overflow-hidden bg-gray-200 items-center justify-center ${className}`}
    >
      {source ? (
        <Image
          source={source}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <Text className={`${textSizeStyles[size]} font-semibold text-gray-600`}>
          {initials}
        </Text>
      )}
    </View>
  );
}
