import { invoke } from '@tauri-apps/api/core';

export async function greet(name: string): Promise<string> {
  return await invoke('greet', { name });
}

export async function getSystemInfo(): Promise<string> {
  return await invoke('get_system_info');
}

// Utilidades para verificar si estamos en Tauri
export const isTauri = () => {
  return '__TAURI__' in window;
};

// Wrapper para comandos de Tauri con fallback para desarrollo web
export async function tauriInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  if (isTauri()) {
    return await invoke<T>(command, args);
  }
  
  // Fallback para desarrollo web
  console.warn(`Tauri command '${command}' called in web mode`);
  throw new Error('Tauri commands are not available in web mode');
}
