"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Contact } from "@/types/hotel";
import { computeScore } from "@/lib/scoring";
import { CargoSelect } from "@/components/CargoSelect";

const EMPTY = { nombre: "", apellido: "", email: "", numero: "", cargo: "" };

async function recalcScore(supabase: ReturnType<typeof createClient>, hotelId: string) {
  const { data: hotel } = await supabase.from("hotels").select("*").eq("id", hotelId).single();
  const { data: contacts } = await supabase.from("contacts").select("*").eq("hotel_id", hotelId);
  if (!hotel) return;
  const { score, tier } = computeScore(hotel, contacts ?? []);
  await supabase.from("hotels").update({ score, tier }).eq("id", hotelId);
}

export function ContactsSection({ hotelId, contacts }: { hotelId: string; contacts: Contact[] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    setLoading(true);
    await supabase.from("contacts").insert({
      hotel_id: hotelId,
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim() || null,
      email: form.email.trim() || null,
      numero: form.numero.trim() || null,
      cargo: form.cargo.trim() || null,
    });
    await recalcScore(supabase, hotelId);
    setForm(EMPTY);
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await supabase.from("contacts").delete().eq("id", id);
    await recalcScore(supabase, hotelId);
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Contactos</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showForm ? "Cancelar" : "+ Añadir contacto"}
        </button>
      </div>

      {/* Formulario nuevo contacto */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Apellido</label>
              <input
                value={form.apellido}
                onChange={(e) => set("apellido", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Correo</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
              <input
                type="tel"
                value={form.numero}
                onChange={(e) => set("numero", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Cargo</label>
              <CargoSelect value={form.cargo} onChange={(v) => set("cargo", v)} />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !form.nombre.trim()}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar contacto"}
          </button>
        </form>
      )}

      {/* Lista de contactos */}
      {contacts.length === 0 && !showForm && (
        <p className="text-sm text-gray-400">Sin contactos registrados.</p>
      )}
      <div className="space-y-3">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <p className="font-medium text-gray-900 text-sm">
                {c.nombre}{c.apellido ? ` ${c.apellido}` : ""}
                {c.cargo && <span className="ml-2 text-xs text-gray-500 font-normal">{c.cargo}</span>}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {c.email && (
                  <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">
                    {c.email}
                  </a>
                )}
                {c.numero && <span>{c.numero}</span>}
              </div>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              disabled={deleting === c.id}
              className="text-gray-300 hover:text-red-400 transition-colors text-xs ml-3 mt-0.5"
            >
              {deleting === c.id ? "..." : "✕"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
