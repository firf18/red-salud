import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface StatsCardProps {
  Icon: React.ElementType;
  value: number | string;
  label: string;
  sublabel?: string;
  color: string;
  onPress?: () => void;
}

export function StatsCard({
  Icon,
  value,
  label,
  sublabel,
  color,
  onPress,
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100',
    orange: 'bg-orange-100',
    purple: 'bg-purple-100',
    green: 'bg-green-100',
  };

  const Component = onPress ? Pressable : View;

  return (
    <Component
      onPress={onPress}
      className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
    >
      <View className="items-center">
        <View className={`h-12 w-12 rounded-full ${colorClasses[color as keyof typeof colorClasses] || 'bg-gray-100'} items-center justify-center mb-2`}>
          <Icon size={24} color="#111827" />
        </View>
        <Text className="text-3xl font-bold text-gray-900">{value}</Text>
        <Text className="text-sm text-gray-600 text-center mt-1">{label}</Text>
        {sublabel && (
          <Text className="text-xs text-gray-500 text-center mt-0.5">{sublabel}</Text>
        )}
      </View>
    </Component>
  );
}
