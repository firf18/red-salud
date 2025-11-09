package com.example.red_salud_paciente.presentation.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.red_salud_paciente.RedSaludApp
import com.example.red_salud_paciente.data.models.HealthMetric
import com.example.red_salud_paciente.data.models.LabResult
import com.example.red_salud_paciente.data.models.Medication
import com.example.red_salud_paciente.presentation.viewmodels.HealthMetricViewModel
import com.example.red_salud_paciente.presentation.viewmodels.LabViewModel
import com.example.red_salud_paciente.presentation.viewmodels.MedicationViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MedicationsScreen(
    userId: String,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val app = context.applicationContext as RedSaludApp
    val viewModel = remember { MedicationViewModel(app.medicationRepository) }

    val medications by viewModel.medications.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(userId) {
        viewModel.loadMedications(userId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mis Medicamentos") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (medications.isEmpty()) {
            EmptyStateScreen(
                icon = Icons.Default.Medication,
                title = "Sin medicamentos",
                message = "No tienes medicamentos registrados",
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
                items(medications) { medication ->
                    MedicationDetailCard(medication)
                }
            }
        }
    }
}

@Composable
fun MedicationDetailCard(medication: Medication) {
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
                        text = medication.name,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = medication.dosage ?: "N/A",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                AssistChip(label = { Text(medication.status) }, onClick = {})
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            Row(
                modifier = Modifier.padding(bottom = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.AccessTime, contentDescription = "Frequency", modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(medication.frequency ?: "N/A", style = MaterialTheme.typography.bodySmall)
            }

            Row(
                modifier = Modifier.padding(bottom = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.DateRange, contentDescription = "Start", modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Desde: ${medication.startDate}", style = MaterialTheme.typography.bodySmall)
            }

            if (medication.endDate != null) {
                Row(
                    modifier = Modifier.padding(bottom = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.DateRange, contentDescription = "End", modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Hasta: ${medication.endDate}", style = MaterialTheme.typography.bodySmall)
                }
            }

            if (medication.instructions != null) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                        .padding(8.dp)
                        .background(
                            MaterialTheme.colorScheme.primaryContainer,
                            shape = MaterialTheme.shapes.small
                        )
                ) {
                    Text("Indicaciones:", style = MaterialTheme.typography.labelSmall)
                    Text(medication.instructions, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LabResultsScreen(
    userId: String,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val app = context.applicationContext as RedSaludApp
    val viewModel = remember { LabViewModel(app.labRepository) }

    val labResults by viewModel.labResults.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(userId) {
        viewModel.loadLabResults(userId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Resultados de Laboratorio") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (labResults.isEmpty()) {
            EmptyStateScreen(
                icon = Icons.Default.Science,
                title = "Sin resultados",
                message = "No tienes resultados de laboratorio",
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
                items(labResults) { result ->
                    LabResultCard(result)
                }
            }
        }
    }
}

@Composable
fun LabResultCard(result: LabResult) {
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
                        text = result.examType,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = result.resultDate,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                val statusColor = when (result.status) {
                    "completado" -> MaterialTheme.colorScheme.primary
                    "pendiente" -> MaterialTheme.colorScheme.tertiary
                    else -> MaterialTheme.colorScheme.surfaceVariant
                }
                AssistChip(label = { Text(result.status) }, onClick = {})
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            if (result.result != null) {
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
                    Text("Resultado:", style = MaterialTheme.typography.labelSmall)
                    Text(result.result, style = MaterialTheme.typography.bodySmall)
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            if (result.referenceValues != null) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                        .background(
                            MaterialTheme.colorScheme.secondaryContainer,
                            shape = MaterialTheme.shapes.small
                        )
                        .padding(8.dp)
                ) {
                    Text("Valores de referencia:", style = MaterialTheme.typography.labelSmall)
                    Text(result.referenceValues, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HealthMetricsScreen(
    userId: String,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    val app = context.applicationContext as RedSaludApp
    val viewModel = remember { HealthMetricViewModel(app.healthMetricRepository) }

    val metrics by viewModel.metrics.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    var showNewMetricDialog by remember { mutableStateOf(false) }

    LaunchedEffect(userId) {
        viewModel.loadMetrics(userId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Métricas de Salud") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showNewMetricDialog = true }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Metric")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (metrics.isEmpty()) {
            EmptyStateScreen(
                icon = Icons.Default.FavoriteBorder,
                title = "Sin métricas",
                message = "Comienza a registrar tus métricas de salud",
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                action = {
                    Button(onClick = { showNewMetricDialog = true }) {
                        Text("Registrar métrica")
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
                items(metrics) { metric ->
                    HealthMetricCard(metric)
                }
            }
        }
    }

    if (showNewMetricDialog) {
        NewMetricDialog(
            onDismiss = { showNewMetricDialog = false },
            onConfirm = { metric ->
                viewModel.recordMetric(metric)
                showNewMetricDialog = false
            }
        )
    }
}

@Composable
fun HealthMetricCard(metric: HealthMetric) {
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
                        text = metric.metricType,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = metric.recordDate,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            Row(
                modifier = Modifier.padding(bottom = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.AutoMirrored.Filled.TrendingUp, contentDescription = "Value", modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("${metric.value} ${metric.unit ?: ""}", style = MaterialTheme.typography.bodySmall)
            }

            if (metric.notes != null) {
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
                    Text(metric.notes, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

@Composable
fun NewMetricDialog(
    onDismiss: () -> Unit,
    onConfirm: (HealthMetric) -> Unit
) {
    var metricType by remember { mutableStateOf("") }
    var value by remember { mutableStateOf("") }
    var unit by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Registrar Métrica") },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = metricType,
                    onValueChange = { metricType = it },
                    label = { Text("Tipo de métrica") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = value,
                    onValueChange = { value = it },
                    label = { Text("Valor") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = unit,
                    onValueChange = { unit = it },
                    label = { Text("Unidad") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Notas") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                val metric = HealthMetric(
                    id = "",
                    patientId = "",
                    metricType = metricType,
                    value = value.toDoubleOrNull() ?: 0.0,
                    unit = unit,
                    recordDate = System.currentTimeMillis().toString(),
                    notes = if (notes.isNotEmpty()) notes else null
                )
                onConfirm(metric)
            }) {
                Text("Guardar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

