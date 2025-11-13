import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@mobile/providers/AuthProvider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

import { useAppointments, useEspecialidades, useDoctorsByEspecialidad } from '@mobile/hooks';
import { Button, Input, Modal } from '@mobile/components/ui';
import { DoctorSelector, DateTimePicker } from '@mobile/components/citas';
import type { Doctor } from '@mobile/types/doctor';

// Esquema de validación
const appointmentSchema = z.object({
  especialidad: z.string().min(1, 'Selecciona una especialidad'),
  medico_id: z.string().min(1, 'Selecciona un médico'),
  fecha: z.date({ required_error: 'Selecciona una fecha' }),
  hora: z.string().min(1, 'Selecciona una hora'),
  tipo: z.string().optional(),
  notas: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function NuevaCita() {
  const router = useRouter();
  const { user } = useAuth();
  const { create } = useAppointments(user?.id!);

  const [showEspecialidadModal, setShowEspecialidadModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');

  const { data: especialidades } = useEspecialidades();
  const { data: doctores } = useDoctorsByEspecialidad(selectedEspecialidad || null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const [hh, mm] = data.hora.split(':');
      const fechaHora = new Date(data.fecha);
      fechaHora.setHours(parseInt(hh, 10), parseInt(mm, 10), 0, 0);
      await create({
        paciente_id: user!.id,
        medico_id: data.medico_id,
        fecha_hora: fechaHora.toISOString(),
        motivo: data.tipo || 'Consulta General',
        status: 'pendiente',
        notas: data.notas,
      });

      Alert.alert(
        'Cita Creada',
        'Tu cita ha sido agendada exitosamente. Recibirás una confirmación pronto.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la cita. Intenta nuevamente.');
    }
  };

  const handleEspecialidadSelect = (especialidad: string) => {
    setSelectedEspecialidad(especialidad);
    setValue('especialidad', especialidad);
    setShowEspecialidadModal(false);
    // Resetear doctor cuando cambia especialidad
    setSelectedDoctor(null);
    setValue('medico_id', '');
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setValue('medico_id', doctor.id);
    setShowDoctorModal(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setValue('fecha', date);
    setShowDateModal(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setValue('hora', time);
    setShowTimeModal(false);
  };

  // Horarios disponibles (simplificado)
  const availableTimes = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00'
  ];

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4 gap-4">
          {/* Título */}
          <View>
            <Text className="text-2xl font-bold text-gray-900">Nueva Cita</Text>
            <Text className="text-gray-600 mt-1">
              Completa la información para agendar tu cita
            </Text>
          </View>

          {/* Especialidad */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Especialidad *</Text>
            <Controller
              control={control}
              name="especialidad"
              render={({ field }) => (
                <Pressable
                  onPress={() => setShowEspecialidadModal(true)}
                  className={`
                    bg-white border rounded-lg p-4
                    ${errors.especialidad ? 'border-red-500' : 'border-gray-300'}
                  `}
                >
                  <Text className={selectedEspecialidad ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedEspecialidad || 'Seleccionar especialidad'}
                  </Text>
                </Pressable>
              )}
            />
            {errors.especialidad && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.especialidad.message}
              </Text>
            )}
          </View>

          {/* Doctor */}
          <Controller
            control={control}
            name="medico_id"
            render={({ field }) => (
              <DoctorSelector
                doctor={selectedDoctor}
                onPress={() => setShowDoctorModal(true)}
                label="Doctor *"
                error={errors.medico_id?.message}
              />
            )}
          />

          {/* Fecha */}
          <Controller
            control={control}
            name="fecha"
            render={({ field }) => (
              <DateTimePicker
                date={selectedDate}
                onPress={() => setShowDateModal(true)}
                label="Fecha *"
                error={errors.fecha?.message}
                mode="date"
              />
            )}
          />

          {/* Hora */}
          <View>
            <Text className="text-gray-700 font-medium mb-2">Hora *</Text>
            <Controller
              control={control}
              name="hora"
              render={({ field }) => (
                <Pressable
                  onPress={() => setShowTimeModal(true)}
                  className={`
                    bg-white border rounded-lg p-4
                    ${errors.hora ? 'border-red-500' : 'border-gray-300'}
                  `}
                >
                  <Text className={selectedTime ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedTime || 'Seleccionar hora'}
                  </Text>
                </Pressable>
              )}
            />
            {errors.hora && (
              <Text className="text-red-500 text-sm mt-1">{errors.hora.message}</Text>
            )}
          </View>

          {/* Tipo de consulta */}
          <Controller
            control={control}
            name="tipo"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Tipo de Consulta (Opcional)"
                value={value}
                onChangeText={onChange}
                placeholder="Ej: Consulta General, Seguimiento..."
              />
            )}
          />

          {/* Notas */}
          <Controller
            control={control}
            name="notas"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-gray-700 font-medium mb-2">
                  Notas Adicionales (Opcional)
                </Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  multiline
                  numberOfLines={4}
                  className="h-24"
                />
              </View>
            )}
          />

          {/* Botones */}
          <View className="gap-3 mt-4">
            <Button
              title="Agendar Cita"
              onPress={handleSubmit(onSubmit)}
              
            />
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              variant="ghost"
            />
          </View>
        </View>
      </ScrollView>

      {/* Modal de Especialidades */}
      <Modal
        visible={showEspecialidadModal}
        onClose={() => setShowEspecialidadModal(false)}
        title="Seleccionar Especialidad"
      >
        <ScrollView className="max-h-96">
          {especialidades?.map((esp) => (
            <Pressable
              key={esp.id}
              onPress={() => handleEspecialidadSelect(esp.nombre)}
              className="p-4 border-b border-gray-100"
            >
              <Text className="text-gray-900">{esp.nombre}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Modal>

      {/* Modal de Doctores */}
      <Modal
        visible={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
        title="Seleccionar Doctor"
      >
        <ScrollView className="max-h-96">
          {!selectedEspecialidad ? (
            <View className="p-4">
              <Text className="text-gray-500">
                Primero selecciona una especialidad
              </Text>
            </View>
          ) : doctores && doctores.length > 0 ? (
            doctores.map((doctor) => (
              <Pressable
                key={doctor.id}
                onPress={() => handleDoctorSelect(doctor)}
                className="p-4 border-b border-gray-100"
              >
                <Text className="text-gray-900 font-semibold">
                  Dr. {doctor.nombre} {doctor.apellido}
                </Text>
                <Text className="text-gray-600 text-sm">{doctor.especialidad}</Text>
              </Pressable>
            ))
          ) : (
            <View className="p-4">
              <Text className="text-gray-500">
                No hay doctores disponibles para esta especialidad
              </Text>
            </View>
          )}
        </ScrollView>
      </Modal>

      {/* Modal de Fecha (simplificado - usaría un date picker real) */}
      <Modal
        visible={showDateModal}
        onClose={() => setShowDateModal(false)}
        title="Seleccionar Fecha"
      >
        <View className="p-4">
          <Text className="text-gray-600 mb-4">
            Selecciona una fecha para tu cita
          </Text>
          {/* Aquí iría un calendario real */}
          <Button
            title="Seleccionar Hoy"
            onPress={() => handleDateSelect(new Date())}
          />
          <View className="mt-3">
            <Button
              title="Seleccionar Mañana"
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateSelect(tomorrow);
              }}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Hora */}
      <Modal
        visible={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        title="Seleccionar Hora"
      >
        <ScrollView className="max-h-96">
          <View className="p-2">
            {availableTimes.map((time) => (
              <Pressable
                key={time}
                onPress={() => handleTimeSelect(time)}
                className="p-4 border-b border-gray-100"
              >
                <Text className="text-gray-900 text-center">{time}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Modal>
    </>
  );
}
