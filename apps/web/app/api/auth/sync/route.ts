import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { accessToken, refreshToken } = await request.json();
        const cookieStore = cookies();

        // This is essentially to ensure the server-side cookies are set
        // In many cases with @supabase/ssr, this is handled by middleware
        // but if the provider is calling it, we just return success.

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
