package com.example.red_salud_paciente.utils

import android.content.Context
import android.util.Log
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task

object GoogleSignInUtils {
    private var googleSignInClient: GoogleSignInClient? = null
    private const val TAG = "GoogleSignIn"

    fun initializeGoogleSignIn(context: Context, serverClientId: String): GoogleSignInClient {
        val gsoBuilder = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(serverClientId)
            .requestEmail()
            .requestProfile()

        val gso = gsoBuilder.build()
        googleSignInClient = GoogleSignIn.getClient(context, gso)
        return googleSignInClient!!
    }

    fun getGoogleSignInClient(): GoogleSignInClient? = googleSignInClient

    fun handleSignInResult(task: Task<com.google.android.gms.auth.api.signin.GoogleSignInAccount>): GoogleSignInResult {
        return try {
            val account = task.getResult(ApiException::class.java)
            if (account != null) {
                GoogleSignInResult.Success(
                    email = account.email ?: "",
                    displayName = account.displayName ?: "",
                    idToken = account.idToken ?: "",
                    photoUrl = account.photoUrl?.toString()
                )
            } else {
                GoogleSignInResult.Error("Cuenta no disponible")
            }
        } catch (e: ApiException) {
            Log.w(TAG, "Google sign in failed", e)
            GoogleSignInResult.Error("Error en autenticación de Google: ${e.message}")
        }
    }

    fun signOut() {
        googleSignInClient?.signOut()?.addOnCompleteListener {
            Log.d(TAG, "Usuario desconectado de Google")
        }
    }
}

sealed class GoogleSignInResult {
    data class Success(
        val email: String,
        val displayName: String,
        val idToken: String,
        val photoUrl: String? = null
    ) : GoogleSignInResult()

    data class Error(val message: String) : GoogleSignInResult()
}

