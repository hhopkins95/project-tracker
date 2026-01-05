import { NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";

export async function GET() {
  try {
    const service = getWorkspaceService();
    const tree = await service.getWorkspaceTree();

    return NextResponse.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error("Error fetching workspace tree:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
