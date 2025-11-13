import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatsCard } from '@mobile/components/dashboard';
import { Button } from '@mobile/components/ui/Button';
import { useRouter } from 'expo-router';

export default function MedicoDashboardScreen() {
  const router = useRouter();
  const IconCalendar = (props: any) => <Ionicons name="calendar-outline" {...props} />;
  const IconUsers = (props: any) => <Ionicons name="people-outline" {...props} />;
  const IconClock = (props: any) => <Ionicons name="time-outline" {...props} />;
  const IconStar = (props: any) => <Ionicons name="star-outline" {...props} />;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">Bienvenido, Doctor 👋</Text>
          <Text className="text-gray-600 mt-1">Gestiona tu agenda y pacientes</Text>
        </View>

        <View className="px-4 py-4">
          <View className="flex-row gap-3 mb-3">
            <StatsCard Icon={IconCalendar} value={0} label="Citas Hoy" color="blue" onPress={() => router.push('/(tabs-medico)/medico/citas')} />
            <StatsCard Icon={IconUsers} value={0} label="Pacientes" color="green" onPress={() => router.push('/(tabs-medico)/medico/pacientes')} />
          </View>
          <View className="flex-row gap-3">
            <StatsCard Icon={IconClock} value={0} label="Completadas" color="purple" onPress={() => router.push('/(tabs-medico)/medico/citas')} />
            <StatsCard Icon={IconStar} value={'0.0'} label="Calificación" color="orange" onPress={() => router.push('/(tabs-medico)/medico/estadisticas')} />
          </View>
        </View>

        <View className="px-4 pb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Acciones Rápidas</Text>
          <View className="gap-3">
            <Button title="🗓️ Ver Agenda" onPress={() => router.push('/(tabs-medico)/medico/citas')} variant="primary" />
            <Button title="👥 Pacientes" onPress={() => router.push('/(tabs-medico)/medico/pacientes')} variant="ghost" />
            <Button title="💬 Mensajería" onPress={() => router.push('/(tabs-medico)/medico/mensajeria')} variant="ghost" />
            <Button title="🎥 Telemedicina" onPress={() => router.push('/(tabs-medico)/medico/telemedicina')} variant="ghost" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
