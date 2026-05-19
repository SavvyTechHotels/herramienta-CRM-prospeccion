import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { TierBadge } from "@/components/TierBadge";
import { StatusBadge } from "@/components/StatusBadge";
import type { Hotel } from "@/types/hotel";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; status?: string; q?: string; assigned?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  let query = supabase
    .from("hotels")
    .select("*")
    .order("score", { ascending: false });

  if (params.tier) query = query.eq("tier", params.tier);
  if (params.status) query = query.eq("status", params.status);
  if (params.q) query = query.ilike("nombre", `%${params.q}%`);
  if (params.assigned === "unassigned") query = query.is("assigned_to", null);
  else if (params.assigned) query = query.eq("assigned_to", params.assigned);

  const [{ data: hotels }, { data: profiles }] = await Promise.all([
    query,
    supabase.from("profiles").select("id, email").order("email"),
  ]);

  const tiers = ["A", "B", "C", "D"];
  const statuses = [
    { value: "no_contactado", label: "No contactado" },
    { value: "contactado", label: "Contactado" },
    { value: "en_seguimiento", label: "En seguimiento" },
    { value: "pasado_a_hubspot", label: "Pasado a HubSpot" },
    { value: "contacto_a_futuro", label: "Contacto a futuro" },
    { value: "cierre_perdido", label: "Cierre perdido" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar userEmail={user?.email ?? ""} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hoteles</h1>
            <p className="text-sm text-gray-500 mt-0.5">{hotels?.length ?? 0} propiedades</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/import"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Subir base de datos
            </Link>
            <Link
              href="/hotels/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Nuevo hotel
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <form method="GET" className="flex gap-2 flex-wrap">
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Buscar hotel..."
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
            <select
              name="tier"
              defaultValue={params.tier ?? ""}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tiers</option>
              {tiers.map((t) => (
                <option key={t} value={t}>Tier {t}</option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select
              name="assigned"
              defaultValue={params.assigned ?? ""}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los asignados</option>
              <option value="unassigned">Sin asignar</option>
              {(profiles ?? []).map((p) => (
                <option key={p.id} value={p.email}>{p.email}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Filtrar
            </button>
            {(params.tier || params.status || params.q || params.assigned) && (
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                Limpiar
              </Link>
            )}
          </form>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hotel</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Segmento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hab.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">★</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">OTA %</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Asignado</th>
              </tr>
            </thead>
            <tbody>
              {hotels?.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No hay hoteles.{" "}
                    <Link href="/hotels/new" className="text-blue-600 hover:underline">
                      Añade el primero
                    </Link>
                  </td>
                </tr>
              )}
              {hotels?.map((hotel: Hotel) => (
                <tr key={hotel.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><TierBadge tier={hotel.tier} /></td>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{hotel.score}</td>
                  <td className="px-4 py-3">
                    <Link href={`/hotels/${hotel.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {hotel.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{hotel.segmento ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{hotel.habitaciones ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{hotel.estrellas ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {hotel.porcentaje_ota != null ? `${hotel.porcentaje_ota}%` : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={hotel.status} /></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{hotel.assigned_to ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
