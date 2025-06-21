import { NextResponse } from "next/server";
import { databaseService } from "../../../services/database.service";

export async function GET() {
  try {
    const isHealthy = await databaseService.healthCheck();

    if (isHealthy) {
      return NextResponse.json({
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          database: "disconnected",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
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
