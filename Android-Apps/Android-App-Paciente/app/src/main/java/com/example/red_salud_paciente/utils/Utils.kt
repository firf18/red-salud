package com.example.red_salud_paciente.utils

import java.text.SimpleDateFormat
import java.util.*

object DateUtils {
    private val dateFormat = SimpleDateFormat("dd/MM/yyyy", Locale.Builder().setLanguage("es").setRegion("ES").build())
    private val dateTimeFormat = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.Builder().setLanguage("es").setRegion("ES").build())
    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)

    fun formatDate(timestamp: String): String {
        return try {
            val date = isoFormat.parse(timestamp)
            if (date != null) dateFormat.format(date) else timestamp
        } catch (e: Exception) {
            timestamp
        }
    }

    fun formatDateTime(timestamp: String): String {
        return try {
            val date = isoFormat.parse(timestamp)
            if (date != null) dateTimeFormat.format(date) else timestamp
        } catch (e: Exception) {
            timestamp
        }
    }

    fun getCurrentDate(): String {
        return dateFormat.format(Date())
    }

    fun getCurrentDateTime(): String {
        return dateTimeFormat.format(Date())
    }
}

object ValidationUtils {
    fun isValidEmail(email: String): Boolean {
        return email.matches(Regex("^[A-Za-z0-9+_.-]+@(.+)$"))
    }

    fun isValidCedula(cedula: String): Boolean {
        return cedula.matches(Regex("^[0-9]{1,12}$"))
    }

    fun isValidPassword(password: String): Boolean {
        return password.length >= 6
    }

    fun isValidPhoneNumber(phone: String): Boolean {
        return phone.matches(Regex("^[0-9+()\\-\\s]{7,}$"))
    }
}

object StringUtils {
    fun truncateText(text: String, maxLength: Int): String {
        return if (text.length > maxLength) {
            text.substring(0, maxLength) + "..."
        } else {
            text
        }
    }

    fun capitalizeWords(text: String): String {
        return text.split(" ").joinToString(" ") { word ->
            word.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.ROOT) else it.toString() }
        }
    }
}

object StorageUtils {
    fun getStatusColor(status: String): String {
        return when (status.lowercase()) {
            "completado", "activa" -> "green"
            "pendiente", "programada" -> "blue"
            "cancelada", "vencida" -> "red"
            else -> "gray"
        }
    }

    fun getStatusLabel(status: String): String {
        return when (status.lowercase()) {
            "completado" -> "Completado"
            "pendiente" -> "Pendiente"
            "cancelada" -> "Cancelada"
            "activa" -> "Activa"
            "inactiva" -> "Inactiva"
            "vencida" -> "Vencida"
            "programada" -> "Programada"
            else -> status
        }
    }
}

