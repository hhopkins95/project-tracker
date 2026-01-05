import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";
import { InitiativeState, MoveInitiativePayload } from "@/core/types";

interface RouteParams {
  params: Promise<{
    state: InitiativeState;
    name: string;
  }>;
}

// POST /api/initiatives/[state]/[name]/move - Move initiative to different state
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { state, name } = await params;
    const service = getWorkspaceService();
    const payload: MoveInitiativePayload = await request.json();

    const initiative = await service.moveInitiative(state, name, payload);

    return NextResponse.json({ success: true, data: initiative });
  } catch (error) {
    console.error("Error moving initiative:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
