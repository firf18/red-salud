package com.example.red_salud_paciente.presentation.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.red_salud_paciente.RedSaludApp
import com.example.red_salud_paciente.data.models.MedicalRecord
import com.example.red_salud_paciente.data.models.Message
import com.example.red_salud_paciente.data.models.TelemedSession
import com.example.red_salud_paciente.presentation.viewmodels.MedicalRecordViewModel
import com.example.red_salud_paciente.presentation.viewmodels.MessageViewModel
import com.example.red_salud_paciente.presentation.viewmodels.TelemedViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MedicalRecordsScreen(
    userId: String,
    onNavigateBack: () -> Unit,
    onViewDetail: (String) -> Unit
) {
    val context = LocalContext.current
    val app = context.applicationContext as RedSaludApp
    val viewModel = remember { MedicalRecordViewModel(app.medicalRecordRepository) }

    val records by viewModel.records.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(userId) {
        viewModel.loadRecords(userId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Historial Médico") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (records.isEmpty()) {
            EmptyStateScreen(
                icon = Icons.Default.Description,
                title = "Sin registros",
                message = "No tienes registros médicos",
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(records) { record ->
                    MedicalRecordCard(record, onClick = { onViewDetail(record.id) })
                }
            }
        }
    }
}

@Composable
fun MedicalRecordCard(record: MedicalRecord, onClick: () -> Unit) {
    Card(modifier = Modifier
        .fillMaxWidth()
        .clickable { onClick() }) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = record.title,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.DateRange, contentDescription = "Date", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(record.consultationDate, style = MaterialTheme.typography.bodySmall)
            }

            if (record.description != null) {
                Text(
                    text = record.description.take(100) + if (record.description.length > 100) "..." else "",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            if (record.diagnosis != null) {
                Row(
                    modifier = Modifier.padding(bottom = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Info, contentDescription = "Diagnosis", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Diagnóstico registrado", style = MaterialTheme.typography.bodySmall)
                }
            }

            Icon(
                Icons.Default.ChevronRight,
                contentDescription = "View",
                modifier = Modifier
                    .align(Alignment.End)
                    .size(20.dp)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessagesScreen(
    userId: String,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val app = context.applicationContext as RedSaludApp
    val viewModel = remember { MessageViewModel(app.messageRepository) }

    val messages by viewModel.messages.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    var showNewMessageDialog by remember { mutableStateOf(false) }
    var messageText by remember { mutableStateOf("") }

    LaunchedEffect(userId) {
        viewModel.loadMessages(userId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mensajería") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (messages.isEmpty()) {
            EmptyStateScreen(
                icon = Icons.AutoMirrored.Filled.Message,
                title = "Sin mensajes",
                message = "No tienes mensajes",
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(messages) { message ->
                    MessageCard(message)
                }
            }
        }
    }
}

@Composable
fun MessageCard(message: Message) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = if (message.isRead) CardDefaults.cardColors() else CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (message.isRead) "Leído" else "Sin leer",
                    style = MaterialTheme.typography.labelSmall
                )
                Text(
                    text = message.createdAt,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            Text(
                text = message.content,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TelemedSessionsScreen(
    userId: String,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val app = context.applicationContext as RedSaludApp
    val viewModel = remember { TelemedViewModel(app.telemedRepository) }

    val sessions by viewModel.sessions.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(userId) {
        viewModel.loadSessions(userId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sesiones de Telemedicina") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (sessions.isEmpty()) {
            EmptyStateScreen(
                icon = Icons.Default.Videocam,
                title = "Sin sesiones",
                message = "No tienes sesiones de telemedicina programadas",
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            )
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(sessions) { session ->
                    TelemedSessionCard(session)
                }
            }
        }
    }
}

@Composable
fun TelemedSessionCard(session: TelemedSession) {
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
                        text = "Dr. ${session.doctorId}",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = session.dateTime,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                AssistChip(label = { Text(session.status) }, onClick = {})
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            Row(
                modifier = Modifier.padding(bottom = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.Videocam, contentDescription = "Session", modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sesión de Telemedicina", style = MaterialTheme.typography.bodySmall)
            }

            if (session.notes != null) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                        .background(
                            MaterialTheme.colorScheme.primaryContainer,
                            shape = MaterialTheme.shapes.small
                        )
                        .padding(8.dp)
                ) {
                    Text("Notas:", style = MaterialTheme.typography.labelSmall)
                    Text(session.notes, style = MaterialTheme.typography.bodySmall)
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            if (session.status == "pendiente" && session.sessionUrl != null) {
                Button(
                    onClick = { /* Open session URL */ },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Unirse a la sesión")
                }
            }
        }
    }
}

