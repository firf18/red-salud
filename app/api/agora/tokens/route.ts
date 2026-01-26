import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// AGORA TOKENS API ROUTE
// Genera tokens de autenticación para Agora.io
// ============================================================================

import {
  generateRTCToken,
  generateSessionTokens,
  getAgoraConfigFromEnv,
  RtcRole,
} from '@/lib/agora/utils/token-generator';

// ============================================================================
// TYPES
// ============================================================================

interface GenerateTokensRequest {
  channelName: string;
  uid: string | number;
  role?: 'publisher' | 'subscriber';
  expiration?: number; // en segundos
}

interface GenerateSessionTokensRequest {
  channelName: string;
  uid: string | number;
  role?: 'publisher' | 'subscriber';
  expiration?: number;
}

// ============================================================================
// POST /api/agora/tokens - Generar token único
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateTokensRequest;

    // Validar parámetros requeridos
    const { channelName, uid, role, expiration } = body;

    if (!channelName) {
      return NextResponse.json(
        { error: 'channelName is required' },
        { status: 400 }
      );
    }

    if (!uid) {
      return NextResponse.json(
        { error: 'uid is required' },
        { status: 400 }
      );
    }

    // Obtener configuración de Agora desde variables de entorno
    const agoraConfig = getAgoraConfigFromEnv();

    // Generar token RTC con la configuración completa
    const token = generateRTCToken(
      agoraConfig.appId,
      agoraConfig.appCertificate,
      channelName,
      typeof uid === 'string' ? parseInt(uid) : uid,
      role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER,
      expiration || 3600 // 1 hora por defecto
    );

    // Calcular fecha de expiración
    const expiresAt = new Date(Date.now() + (expiration || 3600) * 1000);

    return NextResponse.json({
      success: true,
      data: {
        token,
        channelName,
        uid,
        expiresAt: expiresAt.toISOString(),
        expiresIn: expiration || 3600,
      },
    });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/agora/tokens/session - Generar tokens para sesión (RTC + RTM)
// ============================================================================

export async function POST_SESSION(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateSessionTokensRequest;

    // Validar parámetros
    const { channelName, uid, role, expiration } = body;

    if (!channelName) {
      return NextResponse.json(
        { error: 'channelName is required' },
        { status: 400 }
      );
    }

    if (!uid) {
      return NextResponse.json(
        { error: 'uid is required' },
        { status: 400 }
      );
    }

    // Obtener configuración de Agora desde variables de entorno
    const agoraConfig = getAgoraConfigFromEnv();

    // Determinar el rol RTC como string
    const roleString = role === 'subscriber' ? 'subscriber' : 'publisher';

    // Generar ambos tokens (RTC y RTM) con la configuración completa
    const tokens = generateSessionTokens(
      {
        ...agoraConfig,
        channelName,
        uid: typeof uid === 'string' ? parseInt(uid) : uid,
        expirationInSeconds: expiration || 3600,
      },
      roleString === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER
    );

    return NextResponse.json({
      success: true,
      data: {
        rtcToken: tokens.rtcToken,
        rtmToken: tokens.rtmToken,
        channelName,
        uid,
        expiresAt: tokens.expiresAt.toISOString(),
        expiresIn: expiration || 3600,
      },
    });
  } catch (error) {
    console.error('Error generating Agora session tokens:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate session tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
