import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { TasksBoard } from "./TasksBoard";
import type { Task } from "@/types/hotel";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all pending tasks joined with hotel name
  const [{ data: tasks }, { data: profiles }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, hotels(nombre)")
      .eq("status", "pending")
      .order("due_date", { ascending: true }),
    supabase.from("profiles").select("id, email").order("email"),
  ]);

  // Flatten hotel name into task object
  const typedTasks: Task[] = (tasks ?? []).map((t: Record<string, unknown>) => ({
    ...t,
    hotel_nombre: (t.hotels as { nombre: string } | null)?.nombre ?? undefined,
  }));

  const typedProfiles = (profiles as { id: string; email: string }[]) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user?.email ?? ""} pendingTasksCount={typedTasks.length} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
            <p className="text-sm text-gray-500 mt-1">
              Flujo de prospección y tareas manuales pendientes
            </p>
          </div>
          {typedTasks.length > 0 && (
            <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
              {typedTasks.length} pendiente{typedTasks.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <TasksBoard
          tasks={typedTasks}
          profiles={typedProfiles}
          currentUserId={user?.id ?? ""}
        />
      </main>
    </div>
  );
}
