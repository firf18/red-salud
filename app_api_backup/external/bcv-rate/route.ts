import { NextResponse } from 'next/server';
import { BCVService } from '@/lib/services/bcv-service';

export const dynamic = 'force-dynamic'; // No static caching for this route

export async function GET() {
    try {
        const rates = await BCVService.getRates();
        return NextResponse.json({
            success: true,
            rates: rates
        });
    } catch (error) {
        console.error('Error in BCV API:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch rates' },
            { status: 500 }
        );
    }
}
