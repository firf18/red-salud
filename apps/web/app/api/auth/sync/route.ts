import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        await request.json();

        // This is essentially to ensure the server-side cookies are set
        // In many cases with @supabase/ssr, this is handled by middleware
        // but if the provider is calling it, we just return success.

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
