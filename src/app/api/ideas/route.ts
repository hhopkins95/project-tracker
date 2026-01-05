import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";
import { CreateIdeaPayload } from "@/core/types";

// GET /api/ideas - List all ideas
export async function GET() {
  try {
    const service = getWorkspaceService();
    const ideas = await service.listIdeas();

    return NextResponse.json({ success: true, data: ideas });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/ideas - Create a new idea
export async function POST(request: NextRequest) {
  try {
    const service = getWorkspaceService();
    const payload: CreateIdeaPayload = await request.json();

    const idea = await service.createIdea(payload);

    return NextResponse.json({ success: true, data: idea });
  } catch (error) {
    console.error("Error creating idea:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
