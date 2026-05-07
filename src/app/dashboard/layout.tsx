import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_NAME } from "@/lib/constants";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen flex flex-col grid-bg">
      <nav className="border-b border-matrix-900 bg-ink-900/85 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-matrix-50 font-bold tracking-wider"
            >
              <span className="text-matrix-500 text-glow">▊</span>
              <span>{APP_NAME}</span>
            </Link>
            <div className="text-xs text-matrix-700 hidden sm:block">/ dashboard</div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link href="/dashboard/settings" className="btn-ghost hidden sm:inline-flex">
              $ settings
            </Link>
            <span className="hidden md:inline text-matrix-700 truncate max-w-[200px]">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
