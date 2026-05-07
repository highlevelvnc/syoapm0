"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { gradeColor } from "@/lib/scanners/score";
import { fmtNumber } from "@/lib/utils";
import type { Grade } from "@/lib/scanners";

export interface SiteRow {
  id: string;
  domain: string;
  name: string;
  theme_color: string;
  created_at: string;
  score: number | null;
  grade: Grade | null;
  status: string | null;
  scan_at: string | null;
  consents_30d: number;
  cf_hardened: boolean;
  github_repo: string | null;
  github_alerts: number;
  critical_high: number;
  tags: string[];
}

type SortKey = "name" | "score" | "scan_at" | "consents" | "alerts";
type SortDir = "asc" | "desc";

export function SitesTable({ rows }: { rows: SiteRow[] }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) for (const t of r.tags) map.set(t, (map.get(t) ?? 0) + 1);
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return rows.filter((r) => {
      if (activeTag && !r.tags.includes(activeTag)) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.domain.toLowerCase().includes(q) ||
        r.tags.some((t) => t.includes(q))
      );
    });
  }, [rows, search, activeTag]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "score":
          cmp = (a.score ?? -1) - (b.score ?? -1);
          break;
        case "scan_at":
          cmp = (a.scan_at ? new Date(a.scan_at).getTime() : 0) - (b.scan_at ? new Date(b.scan_at).getTime() : 0);
          break;
        case "consents":
          cmp = a.consents_30d - b.consents_30d;
          break;
        case "alerts":
          cmp = a.critical_high - b.critical_high;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  function ageStr(iso: string | null): string {
    if (!iso) return "—";
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60_000);
    if (min < 1) return "agora";
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <input
          type="text"
          placeholder={`procurar em ${rows.length} sites...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-matrix flex-1 min-w-[200px] max-w-md"
        />
        <div className="text-xs text-ink-500">
          {sorted.length} de {rows.length}
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
              activeTag === null
                ? "border-matrix-500/40 bg-matrix-500/10 text-matrix-300"
                : "border-ink-700 text-ink-500 hover:text-ink-300"
            }`}
          >
            all ({rows.length})
          </button>
          {allTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border transition-colors font-mono ${
                activeTag === tag
                  ? "border-matrix-500/40 bg-matrix-500/10 text-matrix-300"
                  : "border-ink-700 text-ink-500 hover:text-ink-300"
              }`}
            >
              #{tag} ({count})
            </button>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="terminal-card p-8 text-center text-sm text-ink-500">
          {rows.length === 0 ? "nenhum site ainda. carrega \"+ adicionar\" ou \"bulk add\"." : "sem matches"}
        </div>
      ) : (
        <div className="terminal-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-ink-500 border-b border-ink-700">
              <tr>
                <Th label="site" onClick={() => toggleSort("name")} active={sortKey === "name"} dir={sortDir} />
                <Th label="score" onClick={() => toggleSort("score")} active={sortKey === "score"} dir={sortDir} className="text-right" />
                <Th label="alerts" onClick={() => toggleSort("alerts")} active={sortKey === "alerts"} dir={sortDir} className="text-right" />
                <Th label="last scan" onClick={() => toggleSort("scan_at")} active={sortKey === "scan_at"} dir={sortDir} />
                <Th label="consents 30d" onClick={() => toggleSort("consents")} active={sortKey === "consents"} dir={sortDir} className="text-right" />
                <th className="p-3 text-left">integrations</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {sorted.map((r) => (
                <tr key={r.id} className="border-b border-ink-700/40 hover:bg-ink-800/40">
                  <td className="p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span style={{ color: r.theme_color }}>▊</span>
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/sites/${r.id}`}
                          className="text-ink-50 font-bold hover:text-matrix-300 truncate block"
                        >
                          {r.name}
                        </Link>
                        <div className="text-[10px] text-ink-500 truncate">{r.domain}</div>
                        {r.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.tags.map((t) => (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActiveTag(t);
                                }}
                                className="text-[9px] px-1.5 py-0 rounded text-matrix-300/80 hover:text-matrix-200 hover:bg-matrix-500/5 font-mono"
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    {r.score !== null && r.grade ? (
                      <div className="inline-flex items-baseline gap-1">
                        <span className="font-bold tabular-nums" style={{ color: gradeColor(r.grade) }}>
                          {r.score}
                        </span>
                        <span className="text-[10px]" style={{ color: gradeColor(r.grade) }}>
                          {r.grade}
                        </span>
                      </div>
                    ) : (
                      <span className="text-ink-600 text-[10px] uppercase">no scan</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {r.critical_high > 0 ? (
                      <span className="text-red-400 font-bold tabular-nums">{r.critical_high}</span>
                    ) : r.score !== null ? (
                      <span className="text-matrix-500">0</span>
                    ) : (
                      <span className="text-ink-600">—</span>
                    )}
                  </td>
                  <td className="p-3 text-ink-300 whitespace-nowrap">{ageStr(r.scan_at)}</td>
                  <td className="p-3 text-right text-ink-300 tabular-nums">
                    {r.consents_30d > 0 ? fmtNumber(r.consents_30d) : <span className="text-ink-600">0</span>}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex gap-1.5 text-[10px] uppercase tracking-wider">
                      <span className={r.cf_hardened ? "text-matrix-300" : "text-ink-600"} title="Cloudflare">
                        cf
                      </span>
                      <span className={r.github_repo ? "text-matrix-300" : "text-ink-600"} title="GitHub">
                        gh{r.github_alerts > 0 && <span className="text-amber-400">{r.github_alerts}</span>}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/dashboard/sites/${r.id}`}
                      className="text-matrix-500 hover:text-matrix-300 text-sm"
                    >
                      →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({
  label,
  onClick,
  active,
  dir,
  className,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  dir: SortDir;
  className?: string;
}) {
  return (
    <th className={`p-3 cursor-pointer hover:text-ink-300 ${active ? "text-matrix-300" : ""} ${className ?? ""}`}>
      <button onClick={onClick} className="uppercase tracking-wider text-[10px] inline-flex items-center gap-1">
        {label}
        {active && <span>{dir === "asc" ? "▴" : "▾"}</span>}
      </button>
    </th>
  );
}
