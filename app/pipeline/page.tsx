import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { PipelineBoard } from "./PipelineBoard";
import type { Hotel } from "@/types/hotel";

export default async function PipelinePage() {
  const supabase = await createClient();
  const [{ data: { user } }, { data: hotels }, { data: profiles }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("hotels").select("*").order("score", { ascending: false }),
    supabase.from("profiles").select("id, email").order("email"),
  ]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar userEmail={user?.email ?? ""} />
      <div className="flex-1 min-h-0 overflow-hidden">
        <PipelineBoard
          hotels={(hotels as Hotel[]) ?? []}
          profiles={(profiles ?? []) as { id: string; email: string }[]}
        />
      </div>
    </div>
  );
}
