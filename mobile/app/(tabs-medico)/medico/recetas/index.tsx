import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

export default function MedicoRecetasScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900">Recetas</Text>
        <Text className="text-gray-600 mt-1">Gestionar prescripciones</Text>
      </View>
    </SafeAreaView>
  );
}
