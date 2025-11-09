package com.example.red_salud_paciente

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

/**
 * Clase principal de la aplicación que utiliza Hilt para la inyección de dependencias.
 * La anotación @HiltAndroidApp es necesaria para que Hilt funcione correctamente.
 */
@HiltAndroidApp
class RedSaludApp : Application()

