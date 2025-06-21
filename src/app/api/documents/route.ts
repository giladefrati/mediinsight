import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // For Unit 5: Dashboard & Navigation, we're focusing on the UI components
    // Firebase Admin setup will be handled in a later unit

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Return empty documents array for now to allow dashboard to function
    // This will be replaced with actual database queries once Firebase Admin is set up
    const documents: unknown[] = [];

    return NextResponse.json({
      documents,
      pagination: {
        limit,
        offset,
        hasMore: false,
      },
      message: "Dashboard API working - Firebase Admin integration pending",
    });
  } catch (error) {
    console.error("Error fetching documents:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
