"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { HotelStatus } from "@/types/hotel";

const STATUSES: { value: HotelStatus; label: string }[] = [
  { value: "no_contactado", label: "No contactado" },
  { value: "contactado", label: "Contactado" },
  { value: "en_seguimiento", label: "En seguimiento" },
  { value: "pasado_a_hubspot", label: "Pasado a HubSpot" },
  { value: "contacto_a_futuro", label: "Contacto a futuro" },
  { value: "cierre_perdido", label: "Cierre perdido" },
];

export function StatusSelect({ hotelId, currentStatus }: { hotelId: string; currentStatus: HotelStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as HotelStatus;
    setStatus(newStatus);
    setSaving(true);
    await supabase.from("hotels").update({ status: newStatus }).eq("id", hotelId);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={handleChange}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-gray-400">Guardando...</span>}
    </div>
  );
}
