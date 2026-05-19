"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { EmailLog } from "@/types/hotel";

type FormState = { asunto: string; cuerpo: string; fecha_envio: string };
const emptyForm = (): FormState => ({ asunto: "", cuerpo: "", fecha_envio: new Date().toISOString().split("T")[0] });

export function EmailsSection({
  hotelId,
  userId,
  userEmail,
  emails,
}: {
  hotelId: string;
  userId: string;
  userEmail: string;
  emails: EmailLog[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asunto.trim() || !form.cuerpo.trim()) return;
    setLoading(true);
    await supabase.from("email_logs").insert({
      hotel_id: hotelId,
      user_id: userId,
      user_email: userEmail,
      asunto: form.asunto.trim(),
      cuerpo: form.cuerpo.trim(),
      fecha_envio: form.fecha_envio,
    });
    setForm(emptyForm());
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Correos enviados</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showForm ? "Cancelar" : "+ Añadir correo"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de envío *</label>
            <input
              type="date"
              value={form.fecha_envio}
              onChange={(e) => set("fecha_envio", e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Asunto *</label>
            <input
              value={form.asunto}
              onChange={(e) => set("asunto", e.target.value)}
              required
              placeholder="Propuesta de colaboración..."
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Contenido del correo *</label>
            <textarea
              value={form.cuerpo}
              onChange={(e) => set("cuerpo", e.target.value)}
              required
              rows={5}
              placeholder="Escribe o pega aquí el contenido del correo enviado..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !form.asunto.trim() || !form.cuerpo.trim()}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar correo"}
          </button>
        </form>
      )}

      {emails.length === 0 && !showForm && (
        <p className="text-sm text-gray-400">Sin correos registrados.</p>
      )}

      <div className="space-y-3">
        {emails.map((e) => (
          <div key={e.id} className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">{e.asunto}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(e.fecha_envio + "T12:00:00").toLocaleDateString("es-ES", {
                    day: "2-digit", month: "short", year: "numeric",
                  })} · {e.user_email}
                </p>
              </div>
              <span className="text-gray-400 text-xs ml-4">{expanded === e.id ? "▲" : "▼"}</span>
            </button>
            {expanded === e.id && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap mt-3">{e.cuerpo}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
