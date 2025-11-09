package com.example.red_salud_paciente.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.red_salud_paciente.presentation.viewmodels.DashboardEvent
import com.example.red_salud_paciente.presentation.viewmodels.DashboardState
import com.example.red_salud_paciente.presentation.viewmodels.DashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.onEvent(DashboardEvent.LoadData)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Mi Salud") },
                actions = {
                    IconButton(onClick = { /* Acción de perfil */ }) {
                        Icon(Icons.Default.AccountCircle, contentDescription = "Perfil")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Inicio") },
                    label = { Text("Inicio") },
                    selected = true,
                    onClick = {}
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Medication, contentDescription = "Medicamentos") },
                    label = { Text("Medicamentos") },
                    selected = false,
                    onClick = {}
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.DateRange, contentDescription = "Citas") },
                    label = { Text("Citas") },
                    selected = false,
                    onClick = {}
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.MoreVert, contentDescription = "Más") },
                    label = { Text("Más") },
                    selected = false,
                    onClick = {}
                )
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (state?.isLoading == true) {
                CircularProgressIndicator()
            } else {
                Text(
                    text = "Bienvenido a Red Salud",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                // Mostrar datos del estado
                state?.appointments?.let { appointments ->
                    Text("Próximas citas: ${appointments.size}")
                } ?: Text("No hay citas programadas")
                
                Spacer(modifier = Modifier.height(8.dp))
                
                state?.medications?.let { medications ->
                    Text("Medicamentos activos: ${medications.size}")
                } ?: Text("No hay medicamentos activos")
                
                Spacer(modifier = Modifier.height(8.dp))
                
                state?.labResults?.let { labResults ->
                    Text("Resultados de laboratorio: ${labResults.size}")
                } ?: Text("No hay resultados de laboratorio")
                
                Spacer(modifier = Modifier.height(8.dp))
                
                state?.healthMetrics?.let { metrics ->
                    Text("Métricas de salud: ${metrics.size}")
                } ?: Text("No hay métricas de salud registradas")
            }

            state?.error?.let { error ->
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(top = 16.dp)
                )
            }
        }
    }
}
