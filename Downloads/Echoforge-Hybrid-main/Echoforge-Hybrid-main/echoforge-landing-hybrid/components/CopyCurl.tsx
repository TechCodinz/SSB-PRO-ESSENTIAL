"use client";
export default function CopyCurl({ label, curl }: { label: string; curl: string }) {
  const onCopy = async () => { await navigator.clipboard.writeText(curl); alert("cURL copied!"); };
  return (<div className="mt-3"><pre className="bg-black/40 p-3 rounded-xl text-xs overflow-x-auto">{curl}</pre><button onClick={onCopy} className="btn btn-ghost mt-2">{label}</button></div>);
}
