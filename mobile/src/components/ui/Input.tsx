import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <View className={`mb-4 ${containerClassName}`}>
        {label && (
          <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
        )}
        <TextInput
          ref={ref}
          className={`
            px-3 py-2.5 
            border rounded-lg 
            ${error ? 'border-red-500' : 'border-gray-300'} 
            bg-white 
            text-gray-900
            ${className}
          `}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {error && <Text className="text-xs text-red-600 mt-1">{error}</Text>}
        {helperText && !error && (
          <Text className="text-xs text-gray-500 mt-1">{helperText}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
