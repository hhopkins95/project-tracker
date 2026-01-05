import { NextResponse } from "next/server";
import { getServerConfig } from "@/server/workspace-manager";

export async function GET() {
  try {
    const config = getServerConfig();

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
