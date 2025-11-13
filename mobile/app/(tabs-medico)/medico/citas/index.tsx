import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

export default function MedicoCitasScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900">Agenda</Text>
        <Text className="text-gray-600 mt-1">Gestiona tus citas del día</Text>
      </View>
    </SafeAreaView>
  );
}