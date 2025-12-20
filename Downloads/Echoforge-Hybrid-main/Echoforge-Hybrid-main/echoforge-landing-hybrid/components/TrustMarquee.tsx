"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const LOGOS = [
  { name: "Orbital Finance", caption: "Global FinTech" },
  { name: "Aegis Cyber", caption: "Cyber Defense" },
  { name: "NovaMedia", caption: "Media Intelligence" },
  { name: "Helios Bank", caption: "Digital Banking" },
  { name: "QuantumGov", caption: "Public Sector AI" },
  { name: "Atlas Logistics", caption: "Supply Chain" },
  { name: "Mythos Studios", caption: "Content Security" },
  { name: "Zenith Health", caption: "Healthcare" },
];

export default function TrustMarquee() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const items = prefersReducedMotion ? LOGOS : [...LOGOS, ...LOGOS];
  const trackClass = prefersReducedMotion ? "flex min-w-full" : "flex min-w-full animate-[marquee_28s_linear_infinite]";

  return (
    <div className="relative overflow-hidden py-10">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent" />
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0b1020] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0b1020] to-transparent" />

      <div className="relative flex overflow-hidden" role="list">
        <div className={trackClass} aria-hidden={prefersReducedMotion ? undefined : true}>
          {items.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              role="listitem"
              className="mx-6 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-md shadow-lg shadow-blue-500/10"
            >
              <span className="text-lg font-semibold tracking-wide bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                {logo.name}
              </span>
              <span className="mt-1 text-xs uppercase tracking-[0.3em] text-white/40">{logo.caption}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-\[marquee_28s_linear_infinite\] {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
