import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const isAuth = await isAdmin();
    return NextResponse.json({ isAdmin: isAuth });
}
