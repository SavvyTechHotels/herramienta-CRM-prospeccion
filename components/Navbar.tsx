"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Navbar({ userEmail, pendingTasksCount }: { userEmail: string; pendingTasksCount?: number }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-gray-900 text-lg">Savvy</Link>
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Hoteles</Link>
        <Link href="/pipeline" className="text-sm text-gray-600 hover:text-gray-900">Pipeline</Link>
        <Link href="/tasks" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
          Tareas
          {pendingTasksCount != null && pendingTasksCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-medium px-1.5 py-0.5 rounded-full leading-none">
              {pendingTasksCount}
            </span>
          )}
        </Link>
        <Link href="/hotels/new" className="text-sm text-gray-600 hover:text-gray-900">+ Nuevo hotel</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500">{userEmail}</span>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
