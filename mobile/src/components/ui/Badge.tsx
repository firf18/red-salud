import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100',
  success: 'bg-green-100',
  warning: 'bg-yellow-100',
  error: 'bg-red-100',
  info: 'bg-blue-100',
};

const textVariantStyles: Record<BadgeVariant, string> = {
  default: 'text-gray-800',
  success: 'text-green-800',
  warning: 'text-yellow-800',
  error: 'text-red-800',
  info: 'text-blue-800',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <View className={`px-2.5 py-1 rounded-full ${variantStyles[variant]} ${className}`}>
      <Text className={`text-xs font-medium ${textVariantStyles[variant]}`}>
        {children}
      </Text>
    </View>
  );
}
