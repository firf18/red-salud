package com.example.red_salud_paciente.presentation.viewmodels

import com.example.red_salud_paciente.data.repositories.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import javax.inject.Inject

sealed class DashboardEvent {
    object LoadData : DashboardEvent()
}

data class DashboardState(
    val appointments: List<Any> = emptyList(),
    val medications: List<Any> = emptyList(),
    val labResults: List<Any> = emptyList(),
    val healthMetrics: List<Any> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val appointmentRepository: AppointmentRepository,
    private val medicationRepository: MedicationRepository,
    private val labRepository: LabRepository,
    private val healthMetricRepository: HealthMetricRepository
) : BaseViewModel<DashboardState, DashboardEvent>() {

    override fun onEvent(event: DashboardEvent) {
        when (event) {
            is DashboardEvent.LoadData -> loadData()
        }
    }

    private fun loadData() {
        setState(DashboardState(isLoading = true))
        
        execute(
            block = {
                val appointmentsDeferred = async { appointmentRepository.getUpcomingAppointments() }
                val medicationsDeferred = async { medicationRepository.getCurrentMedications() }
                val labResultsDeferred = async { labRepository.getLabResults() }
                val healthMetricsDeferred = async { healthMetricRepository.getHealthMetrics() }

                val appointments = appointmentsDeferred.await().getOrElse { emptyList() }
                val medications = medicationsDeferred.await().getOrElse { emptyList() }
                val labResults = labResultsDeferred.await().getOrElse { emptyList() }
                val healthMetrics = healthMetricsDeferred.await().getOrElse { emptyList() }

                DashboardState(
                    appointments = appointments,
                    medications = medications,
                    labResults = labResults,
                    healthMetrics = healthMetrics
                )
            },
            onSuccess = { dashboardState ->
                setState(dashboardState)
            },
            onError = { error ->
                setState(DashboardState(error = error.message))
            }
        )
    }
}
