export function InstallGuide() {
  return (
    <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
      <Step
        n="01"
        title="adiciona o teu site"
        time="10s"
        body={
          <>
            Domain + nome interno. Recebes um <code className="text-matrix-500 bg-ink-950 px-1 rounded">site_id</code>{" "}
            único.
          </>
        }
      />
      <Step
        n="02"
        title="cola 1 linha no <head>"
        time="10s"
        body={
          <pre className="text-[10px] sm:text-xs text-ink-300 mt-2 bg-ink-950 border border-ink-700 rounded p-2 overflow-x-auto">
{`<script
  src="https://syoapm0.vercel.app/cdn/w.js"
  data-site="<O-TEU-ID>"
  async
></script>`}
          </pre>
        }
      />
      <Step
        n="03"
        title="dashboard live"
        time="10s"
        body={
          <>
            Banner RGPD/LGPD aparece, regista consents, e recebes scan diário de segurança com score 0-100,
            achievements e alerts.
          </>
        }
      />
    </div>
  );
}

function Step({
  n,
  title,
  time,
  body,
}: {
  n: string;
  title: string;
  time: string;
  body: React.ReactNode;
}) {
  return (
    <div className="terminal-card p-5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-matrix-500 font-bold text-xs">[{n}]</span>
        <span className="text-[10px] text-ink-500 uppercase tracking-wider">{time}</span>
      </div>
      <div className="text-ink-50 font-bold mb-2">{title}</div>
      <div className="text-xs text-ink-300/70">{body}</div>
    </div>
  );
}
