import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";
import { InitiativeState, MoveInitiativePayload } from "@/core/types";

interface RouteParams {
  params: Promise<{
    state: InitiativeState;
    name: string;
  }>;
}

// GET /api/initiatives/[state]/[name] - Get a single initiative
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { state, name } = await params;
    const service = getWorkspaceService();
    const initiative = await service.getInitiative(state, name);

    if (!initiative) {
      return NextResponse.json(
        { success: false, error: "Initiative not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: initiative });
  } catch (error) {
    console.error("Error fetching initiative:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/initiatives/[state]/[name] - Delete an initiative
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { state, name } = await params;
    const service = getWorkspaceService();
    await service.deleteInitiative(state, name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting initiative:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
