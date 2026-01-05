import { NextRequest, NextResponse } from "next/server";
import { getWorkspaceService } from "@/server/workspace-manager";
import { CreateTodoPayload } from "@/core/types";

// GET /api/todos - List all todos
export async function GET() {
  try {
    const service = getWorkspaceService();
    const todos = await service.listTodos();

    return NextResponse.json({ success: true, data: todos });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const service = getWorkspaceService();
    const payload: CreateTodoPayload = await request.json();

    const todo = await service.createTodo(payload);

    return NextResponse.json({ success: true, data: todo });
  } catch (error) {
    console.error("Error creating todo:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
