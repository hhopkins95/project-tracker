import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";

interface RouteParams {
  params: Promise<{
    name: string;
  }>;
}

// GET /api/todos/[name] - Get a single todo
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { name } = await params;
    const service = getWorkspaceService();
    const todo = await service.getTodo(name);

    if (!todo) {
      return NextResponse.json(
        { success: false, error: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: todo });
  } catch (error) {
    console.error("Error fetching todo:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[name] - Delete a todo
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { name } = await params;
    const service = getWorkspaceService();
    await service.deleteTodo(name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
