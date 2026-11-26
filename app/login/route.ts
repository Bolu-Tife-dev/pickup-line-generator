import { NextResponse } from "next/server";

// Legacy path — login was removed (the app is now auth-free).
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/generate", request.url));
}
