import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";
import { InitiativeState } from "@/core/types";

interface RouteParams {
  params: Promise<{
    state: string;
    name: string;
  }>;
}

// GET /api/initiatives/[state]/[name]/files - Get file tree for initiative
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { state: stateParam, name } = await params;
    const state = stateParam as InitiativeState;
    const service = getWorkspaceService();
    const files = await service.getInitiativeFileTree(state, name);

    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error("Error fetching initiative files:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
