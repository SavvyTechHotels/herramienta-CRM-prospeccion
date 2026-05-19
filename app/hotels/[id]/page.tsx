import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { TierBadge } from "@/components/TierBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { scoreBreakdown, SCORING_MAXES, facturacionEstimada } from "@/lib/scoring";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Hotel, Contact, Note, EmailLog, Task } from "@/types/hotel";
import { NoteForm } from "./NoteForm";
import { StatusSelect } from "./StatusSelect";
import { ContactsSection } from "./ContactsSection";
import { EmailsSection } from "./EmailsSection";
import { AssignedToSelect } from "./AssignedToSelect";
import { DeleteHotelButton } from "./DeleteHotelButton";
import { TasksSection } from "./TasksSection";

export default async function HotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: hotel }, { data: contacts }, { data: notes }, { data: emails }, { data: tasks }, { data: profiles }, { data: allHotels }] = await Promise.all([
    supabase.from("hotels").select("*").eq("id", id).single(),
    supabase.from("contacts").select("*").eq("hotel_id", id),
    supabase.from("notes").select("*").eq("hotel_id", id).order("created_at", { ascending: false }),
    supabase.from("email_logs").select("*").eq("hotel_id", id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").eq("hotel_id", id).order("due_date", { ascending: true }),
    supabase.from("profiles").select("id, email").order("email"),
    supabase.from("hotels").select("id").order("score", { ascending: false }),
  ]);

  if (!hotel) notFound();

  const h = hotel as Hotel;
  const breakdown = scoreBreakdown(h, (contacts as Contact[]) ?? []);
  const typedTasks = (tasks as Task[]) ?? [];
  const hasActiveFlow = typedTasks.some((t) => t.step != null && t.status === "pending");

  const hotelIds = (allHotels ?? []).map((h: { id: string }) => h.id);
  const currentIdx = hotelIds.indexOf(id);
  const prevId = currentIdx > 0 ? hotelIds[currentIdx - 1] : null;
  const nextId = currentIdx < hotelIds.length - 1 ? hotelIds[currentIdx + 1] : null;

  const estRevenue = facturacionEstimada(h.habitaciones, h.adr, h.tasa_ocupacion);

  const breakdownItems = [
    { label: "Tipo de negocio",  value: breakdown.tipo_negocio, max: SCORING_MAXES.tipo_negocio },
    { label: "Volumen negocio",  value: breakdown.volumen,      max: SCORING_MAXES.volumen },
    { label: "Estrellas",        value: breakdown.estrellas,    max: SCORING_MAXES.estrellas },
    { label: "Dependencia OTA",  value: breakdown.ota,          max: SCORING_MAXES.ota },
    { label: "Calidad contacto", value: breakdown.contacto,     max: SCORING_MAXES.contacto },
  ];

  return (
    <div className="min-h-screen">
      <Navbar userEmail={user?.email ?? ""} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Volver
              </Link>
              <div className="flex items-center gap-1">
                {prevId ? (
                  <Link
                    href={`/hotels/${prevId}`}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Hotel anterior"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                ) : (
                  <span className="p-1 text-gray-200 cursor-not-allowed">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </span>
                )}
                <span className="text-xs text-gray-400 font-mono">{currentIdx + 1} / {hotelIds.length}</span>
                {nextId ? (
                  <Link
                    href={`/hotels/${nextId}`}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Hotel siguiente"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <span className="p-1 text-gray-200 cursor-not-allowed">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{h.nombre}</h1>
            <div className="flex items-center gap-3 mt-2">
              <TierBadge tier={h.tier} />
              <span className="font-mono font-bold text-lg">{h.score} pts</span>
              <StatusBadge status={h.status} />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <DeleteHotelButton hotelId={h.id} />
            <Link
              href={`/hotels/${h.id}/edit`}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Editar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Columna izquierda */}
          <div className="col-span-2 space-y-6">
            {/* Datos generales */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Datos generales</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ["Habitaciones", h.habitaciones ?? "—"],
                  ["ADR", h.adr != null ? `${h.adr.toLocaleString("es-ES")} €/noche` : "—"],
                  ["Tasa de ocupación", h.tasa_ocupacion != null ? `${h.tasa_ocupacion}%` : "—"],
                  ["Facturación estimada", estRevenue ? `${estRevenue.toLocaleString("es-ES")} €/año` : "—"],
                  ["Estrellas", h.estrellas ? `${h.estrellas} ★` : "—"],
                  ["Tipo", h.tipo ?? "—"],
                  ["Segmento", h.segmento ?? "—"],
                  ["Tipo de negocio", h.tipo_negocio
                    ? ({ independiente: "Independiente", cadena_pequena: "Cadena pequeña", cadena_mediana: "Cadena mediana", cadena_grande: "Cadena grande", grandes_marcas: "Grandes marcas" } as Record<string, string>)[h.tipo_negocio]
                    : "—"],
                  ["% Revenue OTA", h.porcentaje_ota != null ? `${h.porcentaje_ota}%` : "—"],
                  ["Facturación anual", h.facturacion_anual ? `${h.facturacion_anual.toLocaleString("es-ES")} €` : "—"],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium text-gray-900">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Servicios */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Servicios</h2>
              <div className="grid grid-cols-4 gap-3 text-sm">
                {[
                  ["Spa", h.spa],
                  ["Restaurante", h.restaurante],
                  ["Piscina", h.piscina],
                  ["Gimnasio", h.gimnasio],
                  ["Parking", h.parking],
                  ["Salas reunión", h.salas_reunion],
                  ["Room service", h.room_service],
                ].map(([label, val]) => (
                  <div key={String(label)} className={`flex items-center gap-1.5 ${val ? "text-gray-900" : "text-gray-300"}`}>
                    <span>{val ? "✓" : "✗"}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <ContactsSection hotelId={h.id} contacts={(contacts as Contact[]) ?? []} />

            <EmailsSection
              hotelId={h.id}
              userId={user?.id ?? ""}
              userEmail={user?.email ?? ""}
              emails={(emails as EmailLog[]) ?? []}
            />

            <TasksSection
              hotelId={h.id}
              tasks={typedTasks}
              profiles={(profiles as { id: string; email: string }[]) ?? []}
              hasActiveFlow={hasActiveFlow}
            />

            {/* Notas */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Notas</h2>
              <NoteForm hotelId={h.id} userEmail={user?.email ?? ""} userId={user?.id ?? ""} />
              <div className="mt-4 space-y-3">
                {(notes as Note[])?.map((n) => (
                  <div key={n.id} className="border-l-2 border-gray-200 pl-3">
                    <p className="text-sm text-gray-900">{n.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {n.user_email} · {new Date(n.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            {/* Estado */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Estado</h2>
              <StatusSelect hotelId={h.id} currentStatus={h.status} />
            </div>

            {/* Asignación */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Asignado a</h2>
              <AssignedToSelect hotelId={h.id} current={h.assigned_to} />
            </div>

            {/* Score breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Desglose score</h2>
              <div className="space-y-3">
                {breakdownItems.map(({ label, value, max }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{label}</span>
                      <span className="font-mono">{value.toFixed(1)} / {max}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(value / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-semibold">
                  <span>Total</span>
                  <span className="font-mono">{h.score} / 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
