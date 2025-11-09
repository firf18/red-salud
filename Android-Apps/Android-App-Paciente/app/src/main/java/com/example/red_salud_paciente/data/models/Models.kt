package com.example.red_salud_paciente.data.models

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class User(
    val id: String,
    @Json(name = "email")
    val email: String,
    @Json(name = "nombre_completo")
    val fullName: String? = null,
    @Json(name = "cedula")
    val cedula: String? = null,
    @Json(name = "fecha_nacimiento")
    val birthDate: String? = null,
    @Json(name = "genero")
    val gender: String? = null,
    @Json(name = "telefono")
    val phone: String? = null,
    @Json(name = "direccion")
    val address: String? = null,
    @Json(name = "ciudad")
    val city: String? = null,
    @Json(name = "rol")
    val role: String? = null,
    @Json(name = "created_at")
    val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class Appointment(
    val id: String,
    @Json(name = "paciente_id")
    val patientId: String,
    @Json(name = "doctor_id")
    val doctorId: String? = null,
    @Json(name = "doctor_nombre")
    val doctorName: String? = null,
    @Json(name = "especialidad")
    val specialty: String? = null,
    @Json(name = "fecha_hora")
    val dateTime: String,
    @Json(name = "motivo")
    val reason: String? = null,
    @Json(name = "estado")
    val status: String,
    @Json(name = "tipo")
    val type: String? = null,
    @Json(name = "created_at")
    val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class Medication(
    val id: String,
    @Json(name = "paciente_id")
    val patientId: String,
    @Json(name = "nombre")
    val name: String,
    @Json(name = "dosis")
    val dosage: String? = null,
    @Json(name = "frecuencia")
    val frequency: String? = null,
    @Json(name = "fecha_inicio")
    val startDate: String,
    @Json(name = "fecha_fin")
    val endDate: String? = null,
    @Json(name = "indicaciones")
    val instructions: String? = null,
    @Json(name = "estado")
    val status: String,
    @Json(name = "created_at")
    val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class LabResult(
    val id: String,
    @Json(name = "paciente_id")
    val patientId: String,
    @Json(name = "tipo_examen")
    val examType: String,
    @Json(name = "fecha_resultado")
    val resultDate: String,
    @Json(name = "estado")
    val status: String,
    @Json(name = "resultado")
    val result: String? = null,
    @Json(name = "valores_referencia")
    val referenceValues: String? = null,
    @Json(name = "created_at")
    val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class HealthMetric(
    val id: String,
    @Json(name = "paciente_id")
    val patientId: String,
    @Json(name = "tipo_metrica")
    val metricType: String,
    @Json(name = "valor")
    val value: Double,
    @Json(name = "unidad")
    val unit: String? = null,
    @Json(name = "fecha_registro")
    val recordDate: String,
    @Json(name = "notas")
    val notes: String? = null,
    @Json(name = "created_at")
    val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class MedicalRecord(
    val id: String,
    @Json(name = "paciente_id")
    val patientId: String,
    @Json(name = "doctor_id")
    val doctorId: String? = null,
    @Json(name = "titulo")
    val title: String,
    @Json(name = "descripcion")
    val description: String? = null,
    @Json(name = "fecha_consulta")
    val consultationDate: String,
    @Json(name = "diagnostico")
    val diagnosis: String? = null,
    @Json(name = "tratamiento")
    val treatment: String? = null,
    @Json(name = "created_at")
    val createdAt: String? = null
)

@JsonClass(generateAdapter = true)
data class Message(
    val id: String,
    @Json(name = "remitente_id")
    val senderId: String,
    @Json(name = "receptor_id")
    val recipientId: String,
    @Json(name = "contenido")
    val content: String,
    @Json(name = "leido")
    val isRead: Boolean = false,
    @Json(name = "created_at")
    val createdAt: String
)

@JsonClass(generateAdapter = true)
data class TelemedSession(
    val id: String,
    @Json(name = "paciente_id")
    val patientId: String,
    @Json(name = "doctor_id")
    val doctorId: String,
    @Json(name = "fecha_hora")
    val dateTime: String,
    @Json(name = "estado")
    val status: String,
    @Json(name = "url_sesion")
    val sessionUrl: String? = null,
    @Json(name = "notas")
    val notes: String? = null,
    @Json(name = "created_at")
    val createdAt: String? = null
)

