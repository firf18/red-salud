import React from 'react';
import { View, Text } from 'react-native';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  error: 'bg-red-50 border-red-200',
};

const titleVariantStyles: Record<AlertVariant, string> = {
  info: 'text-blue-900',
  success: 'text-green-900',
  warning: 'text-yellow-900',
  error: 'text-red-900',
};

const textVariantStyles: Record<AlertVariant, string> = {
  info: 'text-blue-800',
  success: 'text-green-800',
  warning: 'text-yellow-800',
  error: 'text-red-800',
};

export function Alert({ variant = 'info', title, children, className = '' }: AlertProps) {
  return (
    <View
      className={`p-4 rounded-lg border ${variantStyles[variant]} ${className}`}
    >
      {title && (
        <Text className={`font-semibold mb-1 ${titleVariantStyles[variant]}`}>
          {title}
        </Text>
      )}
      <Text className={`text-sm ${textVariantStyles[variant]}`}>{children}</Text>
    </View>
  );
}
