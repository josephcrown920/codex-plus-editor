"use client";
import { useState } from "react";

export function TimelineAgentDock() {
  const [open,setOpen]=useState(true);
  const [prompt,setPrompt]=useState("");
  return <aside aria-label="Timeline AI Agent" className="absolute bottom-3 right-3 z-50 w-[360px] rounded-xl border border-white/10 bg-black/90 shadow-2xl">
    <button className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold" onClick={()=>setOpen(v=>!v)}>
      <span>Timeline Agent</span><span>{open?"−":"+"}</span>
    </button>
    {open&&<div className="border-t border-white/10 p-3">
      <div className="mb-2 text-xs opacity-60">Understands selected clips, tracks, playhead and scene context.</div>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Cut this scene tighter, replace the background, or drive this character with the selected performance…" className="min-h-20 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm outline-none"/>
      <div className="mt-2 flex gap-2 text-xs"><button className="rounded-md bg-white px-3 py-2 text-black">Plan edit</button><button className="rounded-md border border-white/10 px-3 py-2">Use selection</button></div>
    </div>}
  </aside>;
}
