import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { ImportClient } from "./ImportClient";
import Link from "next/link";

export default async function ImportPage() {
  const supabase = await createClient();
  const [{ data: { user } }, { data: savedOverrides }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("chain_overrides").select("cadena_nombre, tipo_negocio"),
  ]);

  const savedChainOverrides: Record<string, string> = Object.fromEntries(
    (savedOverrides ?? []).map((r: { cadena_nombre: string; tipo_negocio: string }) => [r.cadena_nombre, r.tipo_negocio])
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user?.email ?? ""} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
            ← Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Subir base de datos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Importa hoteles desde un archivo CSV exportado de Excel o Google Sheets.
          </p>
        </div>

        <ImportClient savedChainOverrides={savedChainOverrides} />
      </main>
    </div>
  );
}
