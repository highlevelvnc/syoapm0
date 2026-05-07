import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function LocaleToggle({ current }: { current: Locale }) {
  return (
    <div className="inline-flex items-center text-[10px] uppercase tracking-wider border border-ink-700 rounded overflow-hidden">
      <Link
        href="/"
        className={`px-2 py-1 ${current === "pt" ? "bg-matrix-500/15 text-matrix-300" : "text-ink-500 hover:text-ink-300"}`}
      >
        PT
      </Link>
      <Link
        href="/en"
        className={`px-2 py-1 ${current === "en" ? "bg-matrix-500/15 text-matrix-300" : "text-ink-500 hover:text-ink-300"}`}
      >
        EN
      </Link>
    </div>
  );
}
