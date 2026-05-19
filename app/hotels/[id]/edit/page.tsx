import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { HotelForm } from "@/components/HotelForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: hotel } = await supabase.from("hotels").select("*").eq("id", id).single();
  if (!hotel) notFound();

  return (
    <div className="min-h-screen">
      <Navbar userEmail={user?.email ?? ""} />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <Link href={`/hotels/${id}`} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">← Volver</Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">Editar hotel</h1>
        <HotelForm hotel={hotel} />
      </main>
    </div>
  );
}
