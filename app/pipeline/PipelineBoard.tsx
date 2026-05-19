"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Hotel, HotelStatus } from "@/types/hotel";
import { TierBadge } from "@/components/TierBadge";
import Link from "next/link";

const COLUMNS: {
  status: HotelStatus;
  label: string;
  accent: string;
  countBg: string;
}[] = [
  { status: "no_contactado",     label: "No contactado",     accent: "bg-gray-400",   countBg: "bg-gray-100 text-gray-600" },
  { status: "contactado",        label: "Contactado",        accent: "bg-blue-400",   countBg: "bg-blue-50 text-blue-700" },
  { status: "en_seguimiento",    label: "En seguimiento",    accent: "bg-purple-400", countBg: "bg-purple-50 text-purple-700" },
  { status: "pasado_a_hubspot",  label: "Pasado a HubSpot",  accent: "bg-green-500",  countBg: "bg-green-50 text-green-700" },
  { status: "contacto_a_futuro", label: "Contacto a futuro", accent: "bg-amber-400",  countBg: "bg-amber-50 text-amber-700" },
  { status: "cierre_perdido",    label: "Cierre perdido",    accent: "bg-red-400",    countBg: "bg-red-50 text-red-700" },
];

const TIERS = ["A", "B", "C", "D"];

export function PipelineBoard({
  hotels: initial,
  profiles,
}: {
  hotels: Hotel[];
  profiles: { id: string; email: string }[];
}) {
  const [hotels, setHotels] = useState<Hotel[]>(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<HotelStatus | null>(null);
  const supabase = createClient();
  const dragId = useRef<string | null>(null);

  // Filtros
  const [q, setQ] = useState("");
  const [tiers, setTiers] = useState<string[]>([]);
  const [assigned, setAssigned] = useState("");

  const filtered = hotels.filter((h) => {
    if (q && !h.nombre.toLowerCase().includes(q.toLowerCase())) return false;
    if (tiers.length && !tiers.includes(h.tier)) return false;
    if (assigned === "unassigned" && h.assigned_to != null) return false;
    if (assigned && assigned !== "unassigned" && h.assigned_to !== assigned) return false;
    return true;
  });

  const byStatus = (s: HotelStatus) => filtered.filter((h) => h.status === s);

  function toggleTier(t: string) {
    setTiers((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  function clearFilters() {
    setQ("");
    setTiers([]);
    setAssigned("");
  }

  const hasFilters = q || tiers.length > 0 || assigned;

  function onDragStart(id: string) {
    dragId.current = id;
    setDragging(id);
  }

  function onDragEnd() {
    setDragging(null);
    setDragOver(null);
    dragId.current = null;
  }

  async function onDrop(status: HotelStatus) {
    const id = dragId.current;
    if (!id) return;
    const hotel = hotels.find((h) => h.id === id);
    if (!hotel || hotel.status === status) { onDragEnd(); return; }
    setHotels((prev) => prev.map((h) => h.id === id ? { ...h, status } : h));
    onDragEnd();
    await supabase.from("hotels").update({ status }).eq("id", id);
  }

  return (
    <div className="h-full flex flex-col bg-[#f5f8fa]">

      {/* Barra superior con filtros */}
      <div className="flex-shrink-0 px-4 py-2.5 bg-white border-b border-gray-200 flex items-center gap-3 flex-wrap">
        {/* Búsqueda */}
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar hotel..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
        />

        {/* Tier pills */}
        <div className="flex items-center gap-1">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTier(t)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                tiers.includes(t)
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Asignado */}
        <select
          value={assigned}
          onChange={(e) => setAssigned(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los asignados</option>
          <option value="unassigned">Sin asignar</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.email}>{p.email}</option>
          ))}
        </select>

        {/* Limpiar filtros */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-gray-700 underline"
          >
            Limpiar
          </button>
        )}

        {/* Total */}
        <span className="ml-auto text-xs text-gray-400">
          {filtered.length} de {hotels.length} hoteles
        </span>
      </div>

      {/* Área de columnas */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-4 py-4">
        <div
          className="flex h-full gap-3"
          style={{ minWidth: `${COLUMNS.length * 272}px` }}
        >
          {COLUMNS.map((col) => {
            const colHotels = byStatus(col.status);
            const isOver = dragOver === col.status;

            return (
              <div
                key={col.status}
                className="flex flex-col w-64 flex-shrink-0 min-h-0 h-full"
              >
                {/* Cabecera de columna */}
                <div className="flex-shrink-0 bg-white rounded-t-lg border border-b-0 border-gray-200 px-3 pt-3 pb-0">
                  <div className={`h-1 rounded-full ${col.accent} mb-3`} />
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      {col.label}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countBg}`}>
                      {colHotels.length}
                    </span>
                  </div>
                </div>

                {/* Lista de tarjetas */}
                <div
                  className={`flex-1 min-h-0 overflow-y-auto border border-gray-200 rounded-b-lg transition-colors p-2 space-y-2 ${
                    isOver ? "bg-blue-50 border-blue-300 ring-1 ring-inset ring-blue-200" : "bg-gray-50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(col.status); }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
                  }}
                  onDrop={() => onDrop(col.status)}
                >
                  {colHotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      isDragging={dragging === hotel.id}
                      onDragStart={() => onDragStart(hotel.id)}
                      onDragEnd={onDragEnd}
                    />
                  ))}
                  {colHotels.length === 0 && (
                    <div className={`flex items-center justify-center h-14 rounded-md border-2 border-dashed ${
                      isOver ? "border-blue-300" : "border-gray-200"
                    }`}>
                      <span className="text-xs text-gray-300">Arrastra aquí</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HotelCard({
  hotel,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  hotel: Hotel;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-md border border-gray-200 p-3 cursor-grab active:cursor-grabbing select-none transition-all ${
        isDragging ? "opacity-25 scale-95 shadow-none" : "hover:shadow-sm hover:border-gray-300"
      }`}
    >
      {/* Nombre + Tier */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <Link
          href={`/hotels/${hotel.id}`}
          className="text-sm font-semibold text-gray-900 hover:text-blue-600 leading-snug"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        >
          {hotel.nombre}
        </Link>
        <div className="flex-shrink-0">
          <TierBadge tier={hotel.tier} />
        </div>
      </div>

      {/* Score + Segmento */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-mono text-gray-400">{hotel.score} pts</span>
        {hotel.segmento && (
          <>
            <span className="text-gray-200">·</span>
            <span className="text-xs text-gray-400 truncate">{hotel.segmento}</span>
          </>
        )}
      </div>

      {/* Asignado */}
      {hotel.assigned_to && (
        <div className="flex items-center gap-1.5 border-t border-gray-100 pt-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-blue-600 font-semibold">
              {hotel.assigned_to[0].toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-gray-400 truncate">{hotel.assigned_to.split("@")[0]}</span>
        </div>
      )}
    </div>
  );
}
