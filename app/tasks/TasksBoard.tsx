"use client";

import { useState, useTransition } from "react";
import type { Task } from "@/types/hotel";
import { urgencyLabel, taskTypeIcon } from "@/lib/tasks";
import Link from "next/link";
import { resolveTask } from "../hotels/[id]/actions";

function formatDue(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TaskCard({ task }: { task: Task }) {
  const [pending, startTransition] = useTransition();
  const urgency = urgencyLabel(task.due_date);
  const icon = taskTypeIcon(task.type);

  function resolve(resolution: "done" | "skipped") {
    startTransition(() => resolveTask(task.id, resolution, task.hotel_id));
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">{task.title}</p>
            {task.hotel_nombre && (
              <Link
                href={`/hotels/${task.hotel_id}`}
                className="text-xs text-blue-600 hover:underline"
              >
                {task.hotel_nombre}
              </Link>
            )}
          </div>
        </div>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 ${urgency.color}`}>
          {urgency.label}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Vence: {formatDue(task.due_date)}</p>
        {task.step && (
          <span className="text-xs text-gray-400 font-mono">paso {task.step}/5</span>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => resolve("done")}
          disabled={pending}
          className="flex-1 text-xs bg-blue-100 text-blue-700 px-2 py-1.5 rounded-lg hover:bg-blue-200 disabled:opacity-40 transition-colors font-medium"
        >
          Hecho
        </button>
        {task.step != null && (
          <button
            onClick={() => resolve("skipped")}
            disabled={pending}
            className="flex-1 text-xs bg-green-100 text-green-700 px-2 py-1.5 rounded-lg hover:bg-green-200 disabled:opacity-40 transition-colors font-medium"
          >
            Respuesta conseguida
          </button>
        )}
      </div>
    </div>
  );
}

const URGENCY_ORDER = ["Vencida", "Hoy", "Mañana", "Próxima"];

function sortByUrgency(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const ai = URGENCY_ORDER.indexOf(urgencyLabel(a.due_date).label);
    const bi = URGENCY_ORDER.indexOf(urgencyLabel(b.due_date).label);
    if (ai !== bi) return ai - bi;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
}

export function TasksBoard({
  tasks,
  profiles,
  currentUserId,
}: {
  tasks: Task[];
  profiles: { id: string; email: string }[];
  currentUserId: string;
}) {
  const [filterUser, setFilterUser] = useState(currentUserId);

  const pending = tasks.filter(
    (t) => t.status === "pending" && (filterUser === "all" || t.assigned_to === filterUser),
  );
  const sorted = sortByUrgency(pending);

  const overdue = sorted.filter((t) => urgencyLabel(t.due_date).label === "Vencida");
  const today = sorted.filter((t) => urgencyLabel(t.due_date).label === "Hoy");
  const upcoming = sorted.filter((t) => ["Mañana", "Próxima"].includes(urgencyLabel(t.due_date).label));

  return (
    <div className="space-y-6">
      {/* Filtro por usuario */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 font-medium">Ver tareas de:</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterUser("all")}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${filterUser === "all" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
          >
            Todos
          </button>
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterUser(p.id)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${filterUser === p.id ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              {p.id === currentUserId ? `Yo (${p.email})` : p.email}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Sin tareas pendientes</p>
          <p className="text-sm mt-1">Inicia el flujo de prospección desde la ficha de un hotel.</p>
        </div>
      )}

      {overdue.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
            Vencidas
            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {overdue.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdue.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        </section>
      )}

      {today.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            Hoy
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {today.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {today.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            Próximas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        </section>
      )}
    </div>
  );
}
