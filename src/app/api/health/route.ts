import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check without database for now
    return NextResponse.json({
      status: "healthy",
      service: "running",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
