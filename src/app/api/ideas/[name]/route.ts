import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";

interface RouteParams {
  params: Promise<{
    name: string;
  }>;
}

// GET /api/ideas/[name] - Get a single idea
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { name } = await params;
    const service = getWorkspaceService();
    const idea = await service.getIdea(name);

    if (!idea) {
      return NextResponse.json(
        { success: false, error: "Idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: idea });
  } catch (error) {
    console.error("Error fetching idea:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[name] - Delete an idea
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { name } = await params;
    const service = getWorkspaceService();
    await service.deleteIdea(name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting idea:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
