package com.example.red_salud_paciente.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.red_salud_paciente.RedSaludApp
import com.example.red_salud_paciente.data.models.Appointment
import com.example.red_salud_paciente.presentation.viewmodels.AppointmentViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppointmentsScreen(
    userId: String,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val app = context.applicationContext as RedSaludApp
    val viewModel = remember { AppointmentViewModel(app.appointmentRepository) }

    val appointments by viewModel.appointments.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(userId) {
        viewModel.loadAppointments(userId)
    }

    var showNewAppointmentDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mis Citas") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showNewAppointmentDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "New Appointment")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (appointments.isEmpty()) {
            EmptyStateScreen(
                icon = Icons.Default.DateRange,
                title = "Sin citas programadas",
                message = "No tienes citas próximas",
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                action = {
                    Button(onClick = { showNewAppointmentDialog = true }) {
                        Text("Agendar cita")
                    }
                }
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(appointments) { appointment ->
                    AppointmentDetailCard(appointment, onCancel = { 
                        viewModel.cancelAppointment(appointment.id)
                    })
                }
            }
        }
    }

    if (showNewAppointmentDialog) {
        NewAppointmentDialog(
            onDismiss = { showNewAppointmentDialog = false },
            onConfirm = { appointment ->
                viewModel.bookAppointment(appointment)
                showNewAppointmentDialog = false
            }
        )
    }
}

@Composable
fun AppointmentDetailCard(appointment: Appointment, onCancel: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = appointment.doctorName ?: "Doctor",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = appointment.specialty ?: "Especialidad",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
                AssistChip(label = { Text(appointment.status) }, onClick = {})
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            Row(
                modifier = Modifier.padding(bottom = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.DateRange, contentDescription = "Date", modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(appointment.dateTime, style = MaterialTheme.typography.bodySmall)
            }

            if (appointment.reason != null) {
                Row(
                    modifier = Modifier.padding(bottom = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Description, contentDescription = "Reason", modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(appointment.reason, style = MaterialTheme.typography.bodySmall)
                }
            }

            if (appointment.type != null) {
                Row(
                    modifier = Modifier.padding(bottom = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Info, contentDescription = "Type", modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(appointment.type, style = MaterialTheme.typography.bodySmall)
                }
            }

            if (appointment.status == "pendiente") {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { /* Join video call */ },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Unirse")
                    }
                    OutlinedButton(
                        onClick = onCancel,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancelar")
                    }
                }
            }
        }
    }
}

@Composable
fun NewAppointmentDialog(
    onDismiss: () -> Unit,
    onConfirm: (Appointment) -> Unit
) {
    var doctorName by remember { mutableStateOf("") }
    var specialty by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    var dateTime by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nueva Cita") },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = doctorName,
                    onValueChange = { doctorName = it },
                    label = { Text("Doctor") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = specialty,
                    onValueChange = { specialty = it },
                    label = { Text("Especialidad") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = dateTime,
                    onValueChange = { dateTime = it },
                    label = { Text("Fecha y Hora") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    label = { Text("Motivo de consulta") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                val appointment = Appointment(
                    id = "",
                    patientId = "",
                    doctorName = doctorName,
                    specialty = specialty,
                    dateTime = dateTime,
                    status = "pendiente",
                    reason = reason
                )
                onConfirm(appointment)
            }) {
                Text("Agendar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}


