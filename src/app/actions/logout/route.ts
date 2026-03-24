import { clearSessionCookie } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL(ROUTES.home, request.url));
}
