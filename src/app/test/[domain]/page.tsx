import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { normalizeDomain, isValidDomain, getClientIp, hashIp } from "@/lib/utils";
import {
  getCachedScan,
  checkRateLimit,
  runAndPersistPublicScan,
  type PublicScanRow,
} from "@/lib/public-scan";
import { ScanProgress } from "@/components/scan-progress";
import { PublicResult } from "@/components/public-result";
import { PublicScanForm } from "@/components/public-scan-form";
import { APP_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain: raw } = await params;
  const domain = normalizeDomain(decodeURIComponent(raw));
  const cached = await getCachedScan(domain).catch(() => null);

  const title = cached?.score != null
    ? `${domain} — security ${cached.grade} (${cached.score}/100) · BlindAI`
    : `Test ${domain} security · BlindAI`;
  const description = cached?.score != null
    ? `${domain} scored ${cached.score}/100 on BlindAI. ${cached.total_findings} findings detected (${cached.critical_findings} critical, ${cached.high_findings} high).`
    : `Free public security scan: SSL, headers, DNS, exposed paths, anti-phishing.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function TestDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: raw } = await params;
  const domain = normalizeDomain(decodeURIComponent(raw));
  if (!isValidDomain(domain)) notFound();

  return (
    <main className="min-h-screen relative">
      <div className="grid-bg fixed inset-0 -z-10 opacity-50" aria-hidden />
      <nav className="border-b border-matrix-900 bg-ink-900/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-matrix-50 font-bold tracking-wider">
            <span className="text-matrix-500 text-glow">▊</span>
            <span>{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link href="/test" className="btn-ghost hidden sm:inline-flex">
              outro site
            </Link>
            <Link href="/auth/login" className="btn-matrix-solid">
              entrar →
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/test" className="text-xs text-matrix-700 hover:text-matrix-300 mb-4 inline-block">
          ← outro site
        </Link>
        <div className="text-xs uppercase tracking-wider text-matrix-500 mb-2">// public scan</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-matrix-50 mb-2 break-all">{domain}</h1>

        <div className="mt-8">
          <Suspense fallback={<ScanProgress domain={domain} />}>
            <ScanRunner domain={domain} />
          </Suspense>
        </div>

        <div className="mt-12 pt-8 border-t border-matrix-900">
          <div className="text-xs uppercase tracking-wider text-matrix-500 mb-3 text-center">
            // testa outro site
          </div>
          <div className="flex justify-center">
            <PublicScanForm />
          </div>
        </div>
      </section>
    </main>
  );
}

async function ScanRunner({ domain }: { domain: string }) {
  let scan: PublicScanRow | null = await getCachedScan(domain);

  if (!scan) {
    const headersList = await headers();
    const salt = process.env.IP_HASH_SALT || "blindai-default-salt-change-me";
    const ip = getClientIp(headersList);
    const ipHash = ip !== "unknown" ? hashIp(ip, salt) : null;

    if (ipHash) {
      const { allowed, recent } = await checkRateLimit(ipHash);
      if (!allowed) {
        return (
          <div className="terminal-card p-8 text-center max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-wider text-yellow-300 mb-2">
              // rate limit
            </div>
            <div className="text-matrix-50 font-bold text-lg mb-2">
              demasiados scans recentes deste IP ({recent} na última hora)
            </div>
            <p className="text-sm text-matrix-200/70 mb-4">
              Espera ~1 hora ou cria conta grátis para scans ilimitados nos teus sites.
            </p>
            <Link href="/auth/signup" className="btn-matrix-solid">
              $ criar conta →
            </Link>
          </div>
        );
      }
    }

    try {
      scan = await runAndPersistPublicScan({
        domain,
        ipHash,
        ua: headersList.get("user-agent") || null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return (
        <div className="terminal-card p-8 text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-wider text-red-400 mb-2">// scan falhou</div>
          <div className="text-matrix-50 font-bold mb-2">não consegui scannear {domain}</div>
          <p className="text-sm text-matrix-200/70 mb-4">{msg}</p>
          <p className="text-[10px] text-matrix-700">
            verifica que o domínio está online e a responder em HTTPS.
          </p>
        </div>
      );
    }
  }

  return <PublicResult scan={scan!} />;
}
