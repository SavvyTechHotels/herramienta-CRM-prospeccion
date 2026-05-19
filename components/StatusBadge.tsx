import type { HotelStatus } from "@/types/hotel";

const STYLES: Record<HotelStatus, string> = {
  no_contactado: "bg-gray-100 text-gray-600",
  contactado: "bg-blue-100 text-blue-700",
  en_seguimiento: "bg-purple-100 text-purple-700",
  pasado_a_hubspot: "bg-green-100 text-green-700",
  contacto_a_futuro: "bg-amber-100 text-amber-700",
  cierre_perdido: "bg-red-100 text-red-600",
};

const LABELS: Record<HotelStatus, string> = {
  no_contactado: "No contactado",
  contactado: "Contactado",
  en_seguimiento: "En seguimiento",
  pasado_a_hubspot: "Pasado a HubSpot",
  contacto_a_futuro: "Contacto a futuro",
  cierre_perdido: "Cierre perdido",
};

export function StatusBadge({ status }: { status: HotelStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
