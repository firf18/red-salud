package com.example.red_salud_paciente.presentation.viewmodels

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.red_salud_paciente.data.models.*
import com.example.red_salud_paciente.data.repositories.*
import com.example.red_salud_paciente.utils.GoogleSignInUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.util.UUID
import kotlin.Result
import kotlin.Result.Companion.failure
import kotlin.Result.Companion.success

class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser

    init {
        // Observar cambios en el estado de autenticación
        viewModelScope.launch {
            authRepository.getAuthState().collectLatest { authState ->
                when (authState) {
                    AuthState.Authenticated -> checkCurrentUser()
                    AuthState.Unauthenticated -> {
                        _currentUser.value = null
                        _uiState.value = AuthUiState.Idle
                    }
                    AuthState.Loading -> _uiState.value = AuthUiState.Loading
                    is AuthState.Error -> _uiState.value = AuthUiState.Error(authState.message)
                }
            }
        }
    }

    fun register(email: String, password: String, fullName: String, cedula: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = authRepository.register(email, password, fullName, cedula)
            result.onSuccess { user ->
                _currentUser.value = user
                _uiState.value = AuthUiState.Success
            }.onFailure { error ->
                _uiState.value = AuthUiState.Error(error.message ?: "Registration failed")
            }
        }
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = authRepository.login(email, password)
            result.onSuccess { user ->
                _currentUser.value = user
                _uiState.value = AuthUiState.Success
            }.onFailure { error ->
                _uiState.value = AuthUiState.Error(error.message ?: "Login failed")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _currentUser.value = null
            _uiState.value = AuthUiState.Idle
        }
    }

    fun checkCurrentUser() {
        viewModelScope.launch {
            val result = authRepository.getCurrentUser()
            result.onSuccess { user ->
                _currentUser.value = user
            }
        }
    }

    fun loginWithGoogle(context: Context) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = authRepository.loginWithGoogle(context)
            result.onSuccess { user ->
                _currentUser.value = user
                _uiState.value = AuthUiState.Success
            }.onFailure { error ->
                _uiState.value = AuthUiState.Error(error.message ?: "Google Sign-In failed")
            }
        }
    }
}

sealed class AuthUiState {
    object Idle : AuthUiState()
    object Loading : AuthUiState()
    object Success : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AppointmentViewModel(
    private val appointmentRepository: AppointmentRepository
) : ViewModel() {
    private val _appointments = MutableStateFlow<List<Appointment>>(emptyList())
    val appointments: StateFlow<List<Appointment>> = _appointments

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState

    fun loadAppointments() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            val result = appointmentRepository.getUpcomingAppointments()
            result.onSuccess { appointments ->
                _appointments.value = appointments.map { 
                    Appointment(
                        id = it["id"] as String,
                        patientId = it["paciente_id"] as String,
                        doctorId = it["doctor_id"] as? String,
                        doctorName = it["doctor_nombre"] as? String,
                        specialty = it["especialidad"] as? String,
                        dateTime = it["fecha_hora"] as String,
                        reason = it["motivo"] as? String,
                        status = it["estado"] as String,
                        type = it["tipo"] as? String,
                        createdAt = it["created_at"] as? String
                    )
                }
                _uiState.value = UiState.Success
            }.onFailure { error ->
                _uiState.value = UiState.Error(error.message ?: "Failed to load appointments")
            }
        }
    }

    fun bookAppointment(appointment: Appointment) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            // Convertir el objeto Appointment a un mapa para enviarlo al repositorio
            val appointmentData = mapOf(
                "paciente_id" to appointment.patientId,
                "doctor_id" to appointment.doctorId,
                "doctor_nombre" to appointment.doctorName,
                "especialidad" to appointment.specialty,
                "fecha_hora" to appointment.dateTime,
                "motivo" to appointment.reason,
                "estado" to appointment.status,
                "tipo" to appointment.type
            )
            
            // Aquí deberías tener un método en el repositorio para crear una cita
            // Por ahora, solo actualizamos la lista localmente para la demostración
            _appointments.value = _appointments.value + appointment
            _uiState.value = UiState.Success
            
            // Nota: Descomenta el código siguiente cuando implementes el método en el repositorio
            /*
            val result = appointmentRepository.createAppointment(appointmentData)
            result.onSuccess { newAppointment ->
                _appointments.value = _appointments.value + newAppointment
                _uiState.value = UiState.Success
            }.onFailure { error ->
                _uiState.value = UiState.Error(error.message ?: "Failed to book appointment")
            }
            */
        }
    }

    fun cancelAppointment(appointmentId: String) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            
            // Actualizamos el estado localmente
            _appointments.value = _appointments.value.map { apt ->
                if (apt.id == appointmentId) apt.copy(status = "cancelada") else apt
            }
            _uiState.value = UiState.Success
            
            // Nota: Descomenta el código siguiente cuando implementes el método en el repositorio
            /*
            val result = appointmentRepository.cancelAppointment(appointmentId)
            result.onSuccess {
                _appointments.value = _appointments.value.map { apt ->
                    if (apt.id == appointmentId) apt.copy(status = "cancelada") else apt
                }
                _uiState.value = UiState.Success
            }.onFailure { error ->
                _uiState.value = UiState.Error(error.message ?: "Failed to cancel appointment")
            }
            */
        }
    }
}

class MedicationViewModel(
    private val medicationRepository: MedicationRepository
) : ViewModel() {
    private val _medications = MutableStateFlow<List<Medication>>(emptyList())
    val medications: StateFlow<List<Medication>> = _medications

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState

    fun loadMedications() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            val result = medicationRepository.getCurrentMedications()
            result.onSuccess { medications ->
                _medications.value = medications.map { 
                    Medication(
                        id = it["id"] as String,
                        patientId = it["paciente_id"] as String,
                        name = it["nombre"] as String,
                        dosage = it["dosis"] as? String,
                        frequency = it["frecuencia"] as? String,
                        startDate = it["fecha_inicio"] as String,
                        endDate = it["fecha_fin"] as? String,
                        instructions = it["indicaciones"] as? String,
                        status = it["estado"] as String,
                        createdAt = it["created_at"] as? String
                    )
                }
                _uiState.value = UiState.Success
            }.onFailure { error ->
                _uiState.value = UiState.Error(error.message ?: "Failed to load medications")
            }
        }
    }
}

class LabViewModel(
    private val labRepository: LabRepository
) : ViewModel() {
    private val _labResults = MutableStateFlow<List<LabResult>>(emptyList())
    val labResults: StateFlow<List<LabResult>> = _labResults

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState

    fun loadLabResults() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            val result = labRepository.getLabResults()
            result.onSuccess { results ->
                _labResults.value = results.map {
                    LabResult(
                        id = it["id"] as String,
                        patientId = it["paciente_id"] as String,
                        examType = it["tipo_examen"] as String,
                        resultDate = it["fecha_resultado"] as String,
                        status = it["estado"] as String,
                        result = it["resultado"] as? String,
                        referenceValues = it["valores_referencia"] as? String,
                        createdAt = it["created_at"] as? String
                    )
                }
                _uiState.value = UiState.Success
            }.onFailure { error ->
                _uiState.value = UiState.Error(error.message ?: "Failed to load lab results")
            }
        }
    }
}

class HealthMetricViewModel(
    private val healthMetricRepository: HealthMetricRepository
) : ViewModel() {
    private val _metrics = MutableStateFlow<List<HealthMetric>>(emptyList())
    val metrics: StateFlow<List<HealthMetric>> = _metrics

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState

    fun loadMetrics() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            val result = healthMetricRepository.getHealthMetrics()
            result.onSuccess { metrics ->
                _metrics.value = metrics.map {
                    HealthMetric(
                        id = it["id"] as String,
                        patientId = it["paciente_id"] as String,
                        type = it["tipo"] as String,
                        value = (it["valor"] as Number).toDouble(),
                        unit = it["unidad"] as String,
                        date = it["fecha"] as String,
                        notes = it["notas"] as? String,
                        createdAt = it["created_at"] as? String
                    )
                }
                _uiState.value = UiState.Success
            }.onFailure { error ->
                _uiState.value = UiState.Error(error.message ?: "Failed to load metrics")
            }
        }
    }

    fun recordMetric(metric: HealthMetric) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            val metricData = mapOf(
                "paciente_id" to metric.patientId,
                "tipo" to metric.type,
                "valor" to metric.value,
                "unidad" to metric.unit,
                "fecha" to metric.date,
                "notas" to metric.notes
            )
            
            // Actualizamos el estado localmente
            _metrics.value = listOf(metric) + _metrics.value
            _uiState.value = UiState.Success
            
            // Nota: Descomenta el código siguiente cuando implementes el método en el repositorio
            /*
            val result = healthMetricRepository.recordMetric(metricData)
            result.onSuccess { newMetric ->
                _metrics.value = listOf(newMetric) + _metrics.value
                _uiState.value = UiState.Success
            }.onFailure { error ->
                _uiState.value = UiState.Error(error.message ?: "Failed to record metric")
            }
            */
        }
    }
}

class MedicalRecordViewModel(
    private val medicalRecordRepository: MedicalRecordRepository
) : ViewModel() {
    private val _records = MutableStateFlow<List<MedicalRecord>>(emptyList())
    val records: StateFlow<List<MedicalRecord>> = _records

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState

    fun loadRecords() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            val result = medicalRecordRepository.getMedicalRecords()
            result.onSuccess { records ->
                _records.value = records.map {
                    MedicalRecord(
                        id = it["id"] as String,
                        patientId = it["paciente_id"] as String,
                        title = it["titulo"] as String,
                        description = it["descripcion"] as String,
                        date = it["fecha"] as String,
                        type = it["tipo"] as? String,
                        doctorName = it["doctor_nombre"] as? String,
                        diagnosis = it["diagnostico"] as? String,
                        treatment = it["tratamiento"] as? String,
                        notes = it["notas"] as? String,
                        createdAt = it["created_at"] as? String
                    )
                }
                _uiState.value = UiState.Success
            }.onFailure { error ->
                _uiState.value = UiState.Error(error.message ?: "Failed to load records")
            }
        }
    }
}

class MessageViewModel(
    private val messageRepository: MessageRepository
) : ViewModel() {
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState

    private var currentConversationId: String? = null
    private var messagesJob: Job? = null

    fun loadMessages(conversationId: String) {
        currentConversationId = conversationId
        messagesJob?.cancel()
        
        messagesJob = viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                messageRepository.getMessages(conversationId).collect { messageList ->
                    _messages.value = messageList.map {
                        Message(
                            id = it["id"] as String,
                            conversationId = it["conversation_id"] as String,
                            senderId = it["sender_id"] as String,
                            content = it["content"] as String,
                            sentAt = it["created_at"] as String,
                            isRead = it["is_read"] as? Boolean ?: false
                        )
                    }
                    _uiState.value = UiState.Success
                }
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Failed to load messages")
            }
        }
    }

    fun sendMessage(content: String) {
        viewModelScope.launch {
            val conversationId = currentConversationId ?: run {
                _uiState.value = UiState.Error("No conversation selected")
                return@launch
            }
            
            _uiState.value = UiState.Loading
            try {
                messageRepository.sendMessage(conversationId, content)
                _uiState.value = UiState.Success
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Failed to send message")
            }
        }
    }
    
    override fun onCleared() {
        super.onCleared()
        messagesJob?.cancel()
    }
}

class TelemedViewModel(
    private val telemedRepository: TelemedRepository
) : ViewModel() {
    private val _sessions = MutableStateFlow<List<TelemedSession>>(emptyList())
    val sessions: StateFlow<List<TelemedSession>> = _sessions

    private val _uiState = MutableStateFlow<UiState>(UiState.Idle)
    val uiState: StateFlow<UiState> = _uiState

    fun loadSessions() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            val result = telemedRepository.getUpcomingSessions()
            result.onSuccess { sessions ->
                _sessions.value = sessions.map {
                    TelemedSession(
                        id = it["id"] as String,
                        patientId = it["paciente_id"] as String,
                        doctorId = it["doctor_id"] as String,
                        dateTime = it["fecha_hora"] as String,
                        status = it["estado"] as String,
                        sessionUrl = it["url_sesion"] as? String,
                        notes = it["notas"] as? String,
                        createdAt = it["created_at"] as? String
                    )
                }
                _uiState.value = UiState.Success
            }.onFailure { error ->
                _uiState.value = UiState.Error(error.message ?: "Failed to load sessions")
            }
        }
    }
}

sealed class UiState {
    object Idle : UiState()
    object Loading : UiState()
    object Success : UiState()
    data class Error(val message: String) : UiState()
}

