import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";
import { CreateSessionPayload } from "@/core/types";

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const service = getWorkspaceService();
    const payload: CreateSessionPayload = await request.json();

    const session = await service.createSession(payload);

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
