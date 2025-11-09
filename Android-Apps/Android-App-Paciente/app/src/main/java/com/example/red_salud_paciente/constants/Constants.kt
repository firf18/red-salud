package com.example.red_salud_paciente.constants

object AppConstants {
    const val APP_NAME = "Red Salud Paciente"
    const val APP_VERSION = "1.0.0"
    const val MIN_SDK = 31
    const val TARGET_SDK = 36

    // API
    const val REQUEST_TIMEOUT = 30L  // segundos
    const val CONNECT_TIMEOUT = 15L  // segundos

    // UI
    const val ANIMATION_DURATION = 300  // ms
    const val DEFAULT_PAGE_SIZE = 20
    const val MAX_TEXT_LENGTH = 500
}

object ApiRoutes {
    const val BASE_URL = "https://api.redsalud.example.com"

    // Auth
    const val LOGIN = "/auth/login"
    const val REGISTER = "/auth/register"
    const val LOGOUT = "/auth/logout"
    const val PROFILE = "/auth/profile"

    // Appointments
    const val APPOINTMENTS = "/appointments"
    const val APPOINTMENTS_ID = "/appointments/{id}"

    // Medications
    const val MEDICATIONS = "/medications"

    // Laboratory
    const val LAB_RESULTS = "/lab-results"

    // Health Metrics
    const val METRICS = "/health-metrics"

    // Medical Records
    const val RECORDS = "/medical-records"

    // Messages
    const val MESSAGES = "/messages"

    // Telemedicine
    const val TELEMED_SESSIONS = "/telemed-sessions"
}

object PreferenceKeys {
    const val USER_ID = "user_id"
    const val USER_EMAIL = "user_email"
    const val USER_NAME = "user_name"
    const val AUTH_TOKEN = "auth_token"
    const val REFRESH_TOKEN = "refresh_token"
    const val LANGUAGE = "language"
    const val THEME = "theme"
    const val LAST_SYNC = "last_sync"
}

object ErrorMessages {
    const val NETWORK_ERROR = "Error de conexión. Por favor, verifica tu conexión a internet."
    const val AUTHENTICATION_ERROR = "Error de autenticación. Por favor, inicia sesión nuevamente."
    const val SERVER_ERROR = "Error del servidor. Por favor, intenta más tarde."
    const val UNKNOWN_ERROR = "Ocurrió un error desconocido."
    const val TIMEOUT_ERROR = "La solicitud tardó demasiado. Por favor, intenta de nuevo."
    const val INVALID_EMAIL = "El email no es válido."
    const val INVALID_PASSWORD = "La contraseña debe tener al menos 6 caracteres."
    const val INVALID_CEDULA = "La cédula no es válida."
    const val PASSWORDS_DO_NOT_MATCH = "Las contraseñas no coinciden."
    const val USER_NOT_FOUND = "Usuario no encontrado."
    const val INVALID_CREDENTIALS = "Email o contraseña incorrectos."
}

object SuccessMessages {
    const val LOGIN_SUCCESS = "Sesión iniciada correctamente."
    const val REGISTER_SUCCESS = "Cuenta creada correctamente."
    const val LOGOUT_SUCCESS = "Sesión cerrada correctamente."
    const val APPOINTMENT_BOOKED = "Cita agendada correctamente."
    const val APPOINTMENT_CANCELED = "Cita cancelada correctamente."
    const val METRIC_SAVED = "Métrica guardada correctamente."
    const val MESSAGE_SENT = "Mensaje enviado correctamente."
}

object FeatureFlags {
    const val ENABLE_BIOMETRIC = false  // Futuro
    const val ENABLE_NOTIFICATIONS = true
    const val ENABLE_OFFLINE_MODE = false  // Futuro
    const val ENABLE_DARK_MODE = true
}

object RegexPatterns {
    const val EMAIL = "^[A-Za-z0-9+_.-]+@(.+)$"
    const val CEDULA = "^[0-9]{1,12}$"
    const val PHONE = "^[0-9+()\\-\\s]{7,}$"
    const val PASSWORD_STRONG = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@\$!%*?&])[A-Za-z\\d@\$!%*?&]{8,}$"
}

object DateFormats {
    const val DATE = "dd/MM/yyyy"
    const val DATE_TIME = "dd/MM/yyyy HH:mm"
    const val ISO = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    const val TIME_ONLY = "HH:mm"
    const val DISPLAY = "EEEE, d MMMM yyyy"
}

object StatusConstants {
    // Appointment Status
    const val APPOINTMENT_PENDING = "pendiente"
    const val APPOINTMENT_COMPLETED = "completada"
    const val APPOINTMENT_CANCELED = "cancelada"
    const val APPOINTMENT_SCHEDULED = "programada"

    // Medication Status
    const val MEDICATION_ACTIVE = "activa"
    const val MEDICATION_INACTIVE = "inactiva"
    const val MEDICATION_COMPLETED = "completada"

    // Lab Status
    const val LAB_PENDING = "pendiente"
    const val LAB_COMPLETED = "completado"
    const val LAB_PROCESSING = "en_proceso"

    // Telemed Status
    const val TELEMED_PENDING = "pendiente"
    const val TELEMED_ACTIVE = "activa"
    const val TELEMED_COMPLETED = "completada"
    const val TELEMED_CANCELED = "cancelada"
}

