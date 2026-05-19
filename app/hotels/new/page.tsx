import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { HotelForm } from "@/components/HotelForm";
import Link from "next/link";

export default async function NewHotelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      <Navbar userEmail={user?.email ?? ""} />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">← Volver</Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">Nuevo hotel</h1>
        <HotelForm />
      </main>
    </div>
  );
}
