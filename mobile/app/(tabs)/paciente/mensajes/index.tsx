import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MensajeriaPacienteScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900">Mensajería</Text>
        <Text className="text-gray-600 mt-1">
          Próximamente: conversación con tu equipo de salud.
        </Text>
      </View>
    </SafeAreaView>
  );
}
