import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";
import { InitiativeState } from "@/core/types";
import * as path from "path";

interface RouteParams {
  params: Promise<{
    state: string;
    name: string;
  }>;
}

// GET /api/initiatives/[state]/[name]/file?path=... - Get file content
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { state: stateParam, name } = await params;
    const state = stateParam as InitiativeState;

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: "Missing path parameter" },
        { status: 400 }
      );
    }

    const service = getWorkspaceService();
    const content = await service.getInitiativeFile(state, name, filePath);

    if (content === null) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content,
        name: path.basename(filePath),
        path: filePath,
      },
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
