"use client";

import { useState, useTransition } from "react";
import type { Task } from "@/types/hotel";
import { urgencyLabel, taskTypeIcon } from "@/lib/tasks";
import { resolveTask, createManualTask, startProspectionFlow } from "./actions";

function formatDue(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TaskRow({ task, hotelId }: { task: Task; hotelId: string }) {
  const [pending, startTransition] = useTransition();
  const urgency = urgencyLabel(task.due_date);
  const icon = taskTypeIcon(task.type);

  function resolve(resolution: "done" | "skipped") {
    startTransition(() => resolveTask(task.id, resolution, hotelId));
  }

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${task.status !== "pending" ? "opacity-50 bg-gray-50 border-gray-100" : "bg-white border-gray-200"}`}>
      <span className="text-base mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-gray-900">{task.title}</span>
          {task.step && (
            <span className="text-xs text-gray-400 font-mono">paso {task.step}</span>
          )}
          {task.status === "pending" && (
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${urgency.color}`}>
              {urgency.label}
            </span>
          )}
          {task.status !== "pending" && (
            <span className="text-xs text-gray-400">{task.status === "done" ? "Completada" : "Saltada"}</span>
          )}
        </div>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {task.status === "pending" ? "Vence: " : "Venció: "}{formatDue(task.due_date)}
        </p>
      </div>
      {task.status === "pending" && (
        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => resolve("done")}
            disabled={pending}
            title="Marcar como hecha (el prospecto respondió)"
            className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded hover:bg-blue-200 disabled:opacity-40 transition-colors font-medium"
          >
            Hecho
          </button>
          {task.step != null && (
            <button
              onClick={() => resolve("skipped")}
              disabled={pending}
              title="El prospecto ha respondido – finalizar el flujo"
              className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded hover:bg-green-200 disabled:opacity-40 transition-colors font-medium"
            >
              Respuesta conseguida
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ManualTaskForm({
  hotelId,
  onClose,
  profiles,
}: {
  hotelId: string;
  onClose: () => void;
  profiles: { id: string; email: string }[];
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("hotel_id", hotelId);
    startTransition(async () => {
      await createManualTask(fd);
      onClose();
    });
  }

  const today = new Date();
  today.setHours(today.getHours() + 24);
  const defaultDue = today.toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
        <input
          name="title"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Llamar después de feria"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
        <textarea
          name="description"
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha límite *</label>
          <input
            name="due_date"
            type="datetime-local"
            required
            defaultValue={defaultDue}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {profiles.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Asignar a</label>
            <select
              name="assigned_to"
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.email}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {pending ? "Guardando..." : "Guardar tarea"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function TasksSection({
  hotelId,
  tasks,
  profiles,
  hasActiveFlow,
}: {
  hotelId: string;
  tasks: Task[];
  profiles: { id: string; email: string }[];
  hasActiveFlow: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [startingFlow, startFlowTransition] = useTransition();

  const pending = tasks.filter((t) => t.status === "pending");
  const done = tasks.filter((t) => t.status !== "pending");

  function handleStartFlow() {
    startFlowTransition(() => startProspectionFlow(hotelId));
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-900">Tareas</h2>
          {pending.length > 0 && (
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!hasActiveFlow && (
            <button
              onClick={handleStartFlow}
              disabled={startingFlow}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {startingFlow ? "Iniciando..." : "Iniciar prospección"}
            </button>
          )}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showForm ? "Cancelar" : "+ Tarea manual"}
          </button>
        </div>
      </div>

      {showForm && (
        <ManualTaskForm hotelId={hotelId} onClose={() => setShowForm(false)} profiles={profiles} />
      )}

      {pending.length === 0 && done.length === 0 && !showForm && (
        <p className="text-sm text-gray-400">Sin tareas. Inicia el flujo de prospección o crea una tarea manual.</p>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          {pending.map((t) => (
            <TaskRow key={t.id} task={t} hotelId={hotelId} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
            Ver historial ({done.length})
          </summary>
          <div className="space-y-2 mt-2">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} hotelId={hotelId} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
