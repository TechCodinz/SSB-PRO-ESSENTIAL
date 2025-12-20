const PILLARS = [
  {
    title: "Neural Perimeter",
    description: "Deploy behavioral firewalls that evolve with each signal across your entire attack surface.",
    metrics: ["Generative decoys", "Quantum-safe encryption", "Runtime canaries"],
    accent: "from-blue-600/60 via-cyan-500/40 to-blue-600/60",
  },
  {
    title: "Reality Shield",
    description: "Authenticate live audio, video, and synthetic media streams with sub-second veracity scoring.",
    metrics: ["Deepfake DNA scans", "Multi-modal consensus", "Guardian watermarking"],
    accent: "from-purple-600/60 via-pink-500/40 to-purple-600/60",
  },
  {
    title: "Autonomous Ops",
    description: "Fuse detection, response, and cost insights into a single adaptive operations cockpit.",
    metrics: ["Playbook autopilot", "Spend deflection", "Compliance snapshots"],
    accent: "from-emerald-500/60 via-teal-500/40 to-emerald-500/60",
  },
];

export default function ExperiencePillars() {
  return (
    <section className="relative mt-32 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c132b] via-[#0a1020] to-[#121a36] px-8 py-16 shadow-xl shadow-blue-500/10">
      <div className="absolute -top-32 left-20 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-36 right-12 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" aria-hidden="true" />

      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.6em] text-white/40">Enterprise Command Fabric</p>
        <h2 className="mt-4 text-4xl font-black text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text">
          Built to Reinvent Your Mission-Critical Ops
        </h2>
        <p className="mt-4 text-lg text-white/60">
          Every EchoForge pillar is engineered for zero-compromise resilience: real-time sensing, adaptive containment,
          and finance-grade observability in one orchestrated layer.
        </p>
      </header>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.title}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${pillar.accent} p-8 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/30`}
          >
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            <div className="relative z-10 flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Pillar</p>
                <h3 className="mt-3 text-2xl font-bold text-white">{pillar.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-white/70">{pillar.description}</p>
              <ul className="space-y-2 text-sm text-white/70">
                {pillar.metrics.map((metric) => (
                  <li key={metric} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-white/50" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
              <div className="text-[10px] uppercase tracking-[0.4em] text-white/30">Synchronized telemetry</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
