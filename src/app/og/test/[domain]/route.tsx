import { ImageResponse } from "next/og";
import { getCachedScan } from "@/lib/public-scan";
import { normalizeDomain, isValidDomain } from "@/lib/utils";
import { gradeColor } from "@/lib/scanners/score";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain: raw } = await params;
  const domain = normalizeDomain(decodeURIComponent(raw));

  if (!isValidDomain(domain)) {
    return new Response("invalid domain", { status: 400 });
  }

  const scan = await getCachedScan(domain).catch(() => null);
  const score = scan?.score ?? null;
  const grade = scan?.grade ?? null;
  const critical = scan?.critical_findings ?? 0;
  const high = scan?.high_findings ?? 0;
  const total = scan?.total_findings ?? 0;
  const color = grade ? gradeColor(grade as never) : "#4a5462";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0e13",
          fontFamily: "monospace",
          padding: 60,
          position: "relative",
        }}
      >
        {/* grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* brand bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#e6eaf0",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          <span style={{ color: "#10b981", fontSize: 32 }}>▊</span>
          <span>BlindAI</span>
          <span style={{ color: "#4a5462", fontSize: 18, marginLeft: 8 }}>// security scan</span>
        </div>

        {/* domain */}
        <div
          style={{
            display: "flex",
            color: "#99a3b5",
            fontSize: 32,
            marginTop: 30,
            fontWeight: 500,
          }}
        >
          {domain}
        </div>

        {/* SCORE GIANT + GRADE */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 32,
            marginTop: "auto",
            marginBottom: 30,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span
              style={{
                color: "#4a5462",
                fontSize: 16,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              security score
            </span>
            <span
              style={{
                color,
                fontSize: 220,
                fontWeight: 700,
                lineHeight: 0.9,
                letterSpacing: -4,
              }}
            >
              {score ?? "—"}
            </span>
          </div>
          <span
            style={{
              color,
              fontSize: 140,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {grade ?? "?"}
          </span>
        </div>

        {/* findings stats */}
        <div
          style={{
            display: "flex",
            gap: 40,
            color: "#99a3b5",
            fontSize: 22,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ color: critical > 0 ? "#ef4444" : "#4a5462", fontWeight: 700 }}>
              {critical}
            </span>
            <span>critical</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ color: high > 0 ? "#f59e0b" : "#4a5462", fontWeight: 700 }}>
              {high}
            </span>
            <span>high</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ color: "#99a3b5", fontWeight: 700 }}>{total}</span>
            <span>total findings</span>
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 30,
            paddingTop: 20,
            borderTop: "1px solid #1c2330",
            color: "#4a5462",
            fontSize: 16,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          <span>scan grátis · sem signup</span>
          <span>blindai.dev</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
