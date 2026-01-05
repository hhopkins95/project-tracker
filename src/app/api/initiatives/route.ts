import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";
import { CreateInitiativePayload, InitiativeState } from "@/core/types";

// GET /api/initiatives - List all initiatives
export async function GET(request: NextRequest) {
  try {
    const service = getWorkspaceService();
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state") as InitiativeState | null;

    if (state) {
      // Get initiatives for a specific state
      const initiatives = await service.listInitiatives(state);
      return NextResponse.json({ success: true, data: initiatives });
    }

    // Get all initiatives grouped by state
    const [active, backlog, completed] = await Promise.all([
      service.listInitiatives("active"),
      service.listInitiatives("backlog"),
      service.listInitiatives("completed"),
    ]);

    return NextResponse.json({
      success: true,
      data: { active, backlog, completed },
    });
  } catch (error) {
    console.error("Error fetching initiatives:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/initiatives - Create a new initiative
export async function POST(request: NextRequest) {
  try {
    const service = getWorkspaceService();
    const payload: CreateInitiativePayload = await request.json();

    const initiative = await service.createInitiative(payload);

    return NextResponse.json({ success: true, data: initiative });
  } catch (error) {
    console.error("Error creating initiative:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
