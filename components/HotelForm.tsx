"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeScore } from "@/lib/scoring";
import { useRouter } from "next/navigation";
import type { Hotel, HotelStatus } from "@/types/hotel";
import { CargoSelect } from "@/components/CargoSelect";
import { AssignSelect } from "@/components/AssignSelect";

type ContactDraft = { nombre: string; apellido: string; email: string; numero: string; cargo: string };
const EMPTY_CONTACT: ContactDraft = { nombre: "", apellido: "", email: "", numero: "", cargo: "" };

const SEGMENTOS = ["Luxury", "Upper Upscale", "Upscale", "Upper Midscale", "Midscale", "Economy", "Budget"];
const STATUSES: { value: HotelStatus; label: string }[] = [
  { value: "no_contactado", label: "No contactado" },
  { value: "contactado", label: "Contactado" },
  { value: "en_seguimiento", label: "En seguimiento" },
  { value: "pasado_a_hubspot", label: "Pasado a HubSpot" },
  { value: "contacto_a_futuro", label: "Contacto a futuro" },
  { value: "cierre_perdido", label: "Cierre perdido" },
];

type FormData = Omit<Hotel, "id" | "score" | "tier" | "created_at" | "updated_at">;

const TIPO_NEGOCIO_OPTIONS = [
  { value: "independiente",  label: "Independiente" },
  { value: "cadena_pequena", label: "Cadena pequeña" },
  { value: "cadena_mediana", label: "Cadena mediana" },
  { value: "cadena_grande",  label: "Cadena grande" },
  { value: "grandes_marcas", label: "Grandes marcas" },
] as const;

const EMPTY: FormData = {
  nombre: "",
  habitaciones: null,
  adr: null,
  tasa_ocupacion: null,
  estrellas: null,
  tipo: null,
  segmento: null,
  tipo_negocio: null,
  spa: false,
  restaurante: false,
  piscina: false,
  gimnasio: false,
  parking: false,
  salas_reunion: false,
  room_service: false,
  facturacion_anual: null,
  presencia_ota: false,
  porcentaje_ota: null,
  status: "no_contactado",
  assigned_to: null,
};

export function HotelForm({ hotel }: { hotel?: Hotel }) {
  const [contacts, setContacts] = useState<ContactDraft[]>([]);
  const [contactForm, setContactForm] = useState<ContactDraft>(EMPTY_CONTACT);
  const [showContactForm, setShowContactForm] = useState(false);

  function setContactField(key: keyof ContactDraft, value: string) {
    setContactForm((prev) => ({ ...prev, [key]: value }));
  }

  function addContact() {
    if (!contactForm.nombre.trim()) return;
    setContacts((prev) => [...prev, contactForm]);
    setContactForm(EMPTY_CONTACT);
    setShowContactForm(false);
  }

  function removeContact(index: number) {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  }

  const [form, setForm] = useState<FormData>(hotel ? {
    nombre: hotel.nombre,
    habitaciones: hotel.habitaciones,
    adr: hotel.adr,
    tasa_ocupacion: hotel.tasa_ocupacion,
    estrellas: hotel.estrellas,
    tipo: hotel.tipo,
    segmento: hotel.segmento,
    tipo_negocio: hotel.tipo_negocio,
    spa: hotel.spa,
    restaurante: hotel.restaurante,
    piscina: hotel.piscina,
    gimnasio: hotel.gimnasio,
    parking: hotel.parking,
    salas_reunion: hotel.salas_reunion,
    room_service: hotel.room_service,
    facturacion_anual: hotel.facturacion_anual,
    presencia_ota: hotel.presencia_ota,
    porcentaje_ota: hotel.porcentaje_ota,
    status: hotel.status,
    assigned_to: hotel.assigned_to,
  } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const preview = computeScore(form, contacts);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setLoading(true);
    setError("");
    const facturacion_anual =
      form.habitaciones != null && form.adr != null && form.tasa_ocupacion != null
        ? Math.round(form.habitaciones * form.adr * (form.tasa_ocupacion / 100) * 365)
        : null;
    const payload = { ...form, facturacion_anual, ...preview };

    if (hotel) {
      const { error: err } = await supabase.from("hotels").update(payload).eq("id", hotel.id);
      if (err) { setError("Error al guardar"); setLoading(false); return; }
      router.push(`/hotels/${hotel.id}`);
    } else {
      const { data, error: err } = await supabase.from("hotels").insert(payload).select().single();
      if (err) { setError("Error al guardar"); setLoading(false); return; }
      if (contacts.length > 0) {
        await supabase.from("contacts").insert(
          contacts.map((c) => ({
            hotel_id: data.id,
            nombre: c.nombre.trim(),
            apellido: c.apellido.trim() || null,
            email: c.email.trim() || null,
            numero: c.numero.trim() || null,
            cargo: c.cargo.trim() || null,
          }))
        );
      }
      router.push(`/hotels/${data.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Score preview */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
        <div>
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Score calculado</p>
          <p className="text-3xl font-bold text-blue-900">{preview.score}</p>
        </div>
        <div className="text-2xl font-bold text-blue-700">Tier {preview.tier}</div>
      </div>

      {/* Datos básicos */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Datos básicos</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hotel Ejemplo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
            <input
              type="number"
              value={form.habitaciones ?? ""}
              onChange={(e) => set("habitaciones", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ADR (€/noche)</label>
            <input
              type="number"
              min={0}
              value={form.adr ?? ""}
              onChange={(e) => set("adr", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de ocupación (%)</label>
            <input
              type="number"
              min={0} max={100}
              value={form.tasa_ocupacion ?? ""}
              onChange={(e) => set("tasa_ocupacion", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="70"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estrellas</label>
            <input
              type="number"
              min={1} max={5} step={0.5}
              value={form.estrellas ?? ""}
              onChange={(e) => set("estrellas", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <input
              value={form.tipo ?? ""}
              onChange={(e) => set("tipo", e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hotel, Resort, Boutique..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
            <select
              value={form.segmento ?? ""}
              onChange={(e) => set("segmento", e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Seleccionar —</option>
              {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de negocio
              <span className="ml-1 text-xs font-normal text-blue-600">(ponderación principal)</span>
            </label>
            <select
              value={form.tipo_negocio ?? ""}
              onChange={(e) => set("tipo_negocio", (e.target.value || null) as FormData["tipo_negocio"])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Seleccionar —</option>
              {TIPO_NEGOCIO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% Revenue OTA</label>
            <input
              type="number"
              min={0} max={100}
              value={form.porcentaje_ota ?? ""}
              onChange={(e) => set("porcentaje_ota", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="45"
            />
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Servicios</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([
            ["spa", "Spa"],
            ["restaurante", "Restaurante"],
            ["piscina", "Piscina"],
            ["gimnasio", "Gimnasio"],
            ["parking", "Parking"],
            ["salas_reunion", "Salas de reunión"],
            ["room_service", "Room service"],
          ] as [keyof FormData, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={!!form[key]}
                onChange={(e) => set(key, e.target.checked as FormData[typeof key])}
                className="rounded border-gray-300 text-blue-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Seguimiento */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Seguimiento</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as HotelStatus)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
            <AssignSelect value={form.assigned_to} onChange={(v) => set("assigned_to", v)} />
          </div>
        </div>
      </div>

      {/* Contactos — solo al crear */}
      {!hotel && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Contactos</h2>
              <p className="text-xs text-gray-400 mt-0.5">Opcional — puedes añadirlos después</p>
            </div>
            {!showContactForm && (
              <button
                type="button"
                onClick={() => setShowContactForm(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Añadir contacto
              </button>
            )}
          </div>

          {showContactForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                  <input
                    value={contactForm.nombre}
                    onChange={(e) => setContactField("nombre", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apellido</label>
                  <input
                    value={contactForm.apellido}
                    onChange={(e) => setContactField("apellido", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Correo</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactField("email", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Número</label>
                  <input
                    type="tel"
                    value={contactForm.numero}
                    onChange={(e) => setContactField("numero", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cargo</label>
                  <CargoSelect value={contactForm.cargo} onChange={(v) => setContactField("cargo", v)} />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addContact}
                  disabled={!contactForm.nombre.trim()}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  Añadir
                </button>
                <button
                  type="button"
                  onClick={() => { setShowContactForm(false); setContactForm(EMPTY_CONTACT); }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {contacts.length === 0 && !showContactForm && (
            <p className="text-sm text-gray-400">Sin contactos añadidos.</p>
          )}
          <div className="space-y-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="font-medium text-gray-900">{c.nombre}{c.apellido ? ` ${c.apellido}` : ""}</span>
                  {c.cargo && <span className="text-gray-500 ml-2 text-xs">{c.cargo}</span>}
                  <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                    {c.email && <span>{c.email}</span>}
                    {c.numero && <span>{c.numero}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Guardando..." : hotel ? "Guardar cambios" : "Crear hotel"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
