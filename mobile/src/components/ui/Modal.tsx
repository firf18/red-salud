import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  ModalProps as RNModalProps,
} from 'react-native';

interface ModalProps extends Omit<RNModalProps, 'children'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  footer,
  ...props
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
        />
        <View className="bg-white rounded-2xl w-full max-w-md shadow-xl">
          {/* Header */}
          {title && (
            <View className="px-6 py-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">{title}</Text>
            </View>
          )}

          {/* Content */}
          <View className="px-6 py-4">{children}</View>

          {/* Footer */}
          {footer && (
            <View className="px-6 py-4 border-t border-gray-200">{footer}</View>
          )}
        </View>
      </View>
    </RNModal>
  );
}
