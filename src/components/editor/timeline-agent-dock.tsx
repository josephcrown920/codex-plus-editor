"use client";
import {useState} from "react";
import {ArrowUp,Hand,MessageSquare,Sparkles,Square,WandSparkles} from "lucide-react";

export function TimelineAgentDock({prompt,onPrompt,onSend,onCancel,busy,approval,onToggleApproval,modeLabel,selectedLabel,playhead,onOpenAssistant,onCreate}:{prompt:string;onPrompt:(value:string)=>void;onSend:()=>void;onCancel:()=>void;busy:boolean;approval:boolean;onToggleApproval:()=>void;modeLabel:string;selectedLabel?:string;playhead:string;onOpenAssistant:()=>void;onCreate:()=>void}) {
  const [open,setOpen]=useState(true);
  return <div className={"timeline-agent "+(open?"open":"collapsed")}>
    <div className="timeline-agent-head">
      <button type="button" className="timeline-agent-title" onClick={()=>setOpen(v=>!v)} aria-expanded={open}><Sparkles size={14}/><strong>Timeline Agent</strong><span>{modeLabel}</span></button>
      <button type="button" className="timeline-agent-chat" onClick={onOpenAssistant} title="Open full assistant"><MessageSquare size={14}/></button>
    </div>
    {open&&<div className="timeline-agent-body">
      <div className="timeline-agent-context"><span>{selectedLabel?"Selected: "+selectedLabel:"No clip selected"}</span><span>Playhead {playhead}</span></div>
      <textarea aria-label="Timeline agent command" value={prompt} onChange={e=>onPrompt(e.target.value)} maxLength={1000} disabled={busy} placeholder="Tell the agent what to do to this timeline…" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(prompt.trim()&&!busy)onSend();}}}/>
      <div className="timeline-agent-actions">
        <button type="button" className={"timeline-agent-approval "+(approval?"enabled":"")} onClick={onToggleApproval}><Hand size={13}/>{approval?"Review first":"Edit directly"}</button>
        <button type="button" onClick={onCreate}><WandSparkles size={13}/>Generate</button>
        <span className="timeline-agent-spacer"/>
        <button type="button" className="timeline-agent-send" aria-label={busy?"Cancel agent":"Send to timeline agent"} disabled={!busy&&!prompt.trim()} onClick={busy?onCancel:onSend}>{busy?<Square size={11}/>:<ArrowUp size={15}/>}</button>
      </div>
    </div>}
  </div>;
}
