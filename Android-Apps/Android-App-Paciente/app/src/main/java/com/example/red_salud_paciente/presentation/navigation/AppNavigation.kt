package com.example.red_salud_paciente.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.red_salud_paciente.presentation.screens.*

@Composable
fun AppNavigation(
    navController: NavHostController = rememberNavController(),
    userId: String?,
    onLogout: () -> Unit
) {
    NavHost(
        navController = navController,
        startDestination = if (userId != null) "dashboard" else "login"
    ) {
        // Auth Screens
        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate("register")
                }
            )
        }

        composable("register") {
            RegisterScreen(
                onRegisterSuccess = {
                    navController.navigate("dashboard") {
                        popUpTo("register") { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                }
            )
        }

        // Dashboard
        composable("dashboard") {
            if (userId != null) {
                DashboardScreen(
                    userId = userId,
                    onNavigateToAppointments = { navController.navigate("appointments") },
                    onNavigateToMedications = { navController.navigate("medications") },
                    onNavigateToLab = { navController.navigate("lab") },
                    onNavigateToMetrics = { navController.navigate("metrics") },
                    onNavigateToRecords = { navController.navigate("records") },
                    onNavigateToMessages = { navController.navigate("messages") },
                    onNavigateToTelemed = { navController.navigate("telemed") },
                    onLogout = {
                        onLogout()
                        navController.navigate("login") {
                            popUpTo("dashboard") { inclusive = true }
                        }
                    }
                )
            }
        }

        // Content Screens
        composable("appointments") {
            if (userId != null) {
                AppointmentsScreen(
                    userId = userId,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }

        composable("medications") {
            if (userId != null) {
                MedicationsScreen(
                    userId = userId,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }

        composable("lab") {
            if (userId != null) {
                LabResultsScreen(
                    userId = userId,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }

        composable("metrics") {
            if (userId != null) {
                HealthMetricsScreen(
                    userId = userId,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }

        composable("records") {
            if (userId != null) {
                MedicalRecordsScreen(
                    userId = userId,
                    onNavigateBack = { navController.popBackStack() },
                    onViewDetail = { recordId ->
                        // Navigate to record detail
                    }
                )
            }
        }

        composable("messages") {
            if (userId != null) {
                MessagesScreen(
                    userId = userId,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }

        composable("telemed") {
            if (userId != null) {
                TelemedSessionsScreen(
                    userId = userId,
                    onNavigateBack = { navController.popBackStack() }
                )
            }
        }
    }
}

