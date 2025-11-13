import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '@mobile/providers/AuthProvider';

export default function MedicoTabsLayout() {
  const { session } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!session) router.replace('(auth)/login');
  }, [session, router]);

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="medico/index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="medico/citas/index" options={{ title: 'Citas' }} />
      <Tabs.Screen name="medico/pacientes/index" options={{ title: 'Pacientes' }} />
      <Tabs.Screen name="medico/mensajeria/index" options={{ title: 'Mensajería' }} />
      <Tabs.Screen name="medico/telemedicina/index" options={{ title: 'Telemedicina' }} />
      <Tabs.Screen name="medico/recetas/index" options={{ title: 'Recetas' }} />
      <Tabs.Screen name="medico/estadisticas/index" options={{ title: 'Estadísticas' }} />
    </Tabs>
  );
}
