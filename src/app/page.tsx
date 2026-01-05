"use client";

import { useState, useEffect } from "react";
import { WorkspaceTree, InitiativeSummary, TodoSummary, IdeaSummary, Initiative, Todo, Idea } from "@/core/types";
import { Sidebar } from "@/components/Sidebar";
import { InitiativeView } from "@/components/InitiativeView";
import { TodoView } from "@/components/TodoView";
import { IdeaView } from "@/components/IdeaView";
import { CreateModal } from "@/components/CreateModal";
import { EmptyState } from "@/components/EmptyState";

type ViewType = "initiative" | "todo" | "idea" | null;
type CreateType = "initiative" | "todo" | "idea" | null;

interface SelectedItem {
  type: ViewType;
  state?: "active" | "backlog" | "completed";
  name: string;
}

export default function Home() {
  const [workspaceTree, setWorkspaceTree] = useState<WorkspaceTree | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [selectedData, setSelectedData] = useState<Initiative | Todo | Idea | null>(null);
  const [createType, setCreateType] = useState<CreateType>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch workspace tree
  const fetchWorkspaceTree = async () => {
    try {
      const response = await fetch("/api/workspace/tree");
      const result = await response.json();

      if (result.success) {
        setWorkspaceTree(result.data);
      } else {
        setError(result.error || "Failed to fetch workspace");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch selected item details
  const fetchSelectedItem = async () => {
    if (!selectedItem) {
      setSelectedData(null);
      return;
    }

    try {
      let url: string;
      if (selectedItem.type === "initiative") {
        url = `/api/initiatives/${selectedItem.state}/${selectedItem.name}`;
      } else if (selectedItem.type === "todo") {
        url = `/api/todos/${selectedItem.name}`;
      } else if (selectedItem.type === "idea") {
        url = `/api/ideas/${selectedItem.name}`;
      } else {
        return;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setSelectedData(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch item:", err);
    }
  };

  useEffect(() => {
    fetchWorkspaceTree();
  }, []);

  useEffect(() => {
    fetchSelectedItem();
  }, [selectedItem]);

  // Handle item selection from sidebar
  const handleSelectInitiative = (summary: InitiativeSummary) => {
    setSelectedItem({
      type: "initiative",
      state: summary.state,
      name: summary.name,
    });
  };

  const handleSelectTodo = (summary: TodoSummary) => {
    setSelectedItem({
      type: "todo",
      name: summary.name,
    });
  };

  const handleSelectIdea = (summary: IdeaSummary) => {
    setSelectedItem({
      type: "idea",
      name: summary.name,
    });
  };

  // Handle create actions
  const handleCreate = (type: CreateType) => {
    setCreateType(type);
  };

  const handleCreateComplete = () => {
    setCreateType(null);
    fetchWorkspaceTree();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      let url: string;
      if (selectedItem.type === "initiative") {
        url = `/api/initiatives/${selectedItem.state}/${selectedItem.name}`;
      } else if (selectedItem.type === "todo") {
        url = `/api/todos/${selectedItem.name}`;
      } else if (selectedItem.type === "idea") {
        url = `/api/ideas/${selectedItem.name}`;
      } else {
        return;
      }

      const response = await fetch(url, { method: "DELETE" });
      const result = await response.json();

      if (result.success) {
        setSelectedItem(null);
        setSelectedData(null);
        fetchWorkspaceTree();
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  // Handle move initiative
  const handleMoveInitiative = async (targetState: "active" | "backlog" | "completed") => {
    if (!selectedItem || selectedItem.type !== "initiative") return;

    try {
      const response = await fetch(
        `/api/initiatives/${selectedItem.state}/${selectedItem.name}/move`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetState }),
        }
      );
      const result = await response.json();

      if (result.success) {
        setSelectedItem({
          ...selectedItem,
          state: targetState,
        });
        fetchWorkspaceTree();
      }
    } catch (err) {
      console.error("Failed to move initiative:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading workspace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchWorkspaceTree();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        workspaceTree={workspaceTree}
        selectedItem={selectedItem}
        onSelectInitiative={handleSelectInitiative}
        onSelectTodo={handleSelectTodo}
        onSelectIdea={handleSelectIdea}
        onCreate={handleCreate}
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {!selectedItem ? (
          <EmptyState onCreate={handleCreate} />
        ) : selectedItem.type === "initiative" && selectedData ? (
          <InitiativeView
            initiative={selectedData as Initiative}
            onDelete={handleDelete}
            onMove={handleMoveInitiative}
            onRefresh={fetchSelectedItem}
          />
        ) : selectedItem.type === "todo" && selectedData ? (
          <TodoView
            todo={selectedData as Todo}
            onDelete={handleDelete}
          />
        ) : selectedItem.type === "idea" && selectedData ? (
          <IdeaView
            idea={selectedData as Idea}
            onDelete={handleDelete}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {createType && (
        <CreateModal
          type={createType}
          onClose={() => setCreateType(null)}
          onComplete={handleCreateComplete}
        />
      )}
    </div>
  );
}
