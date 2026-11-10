'use client';
import {useMemo,useState} from 'react';
import {effectFilters} from '@/lib/editor/effects';
import {creativeTemplates} from '@/lib/editor/creative-templates';
import {clipPresets,presetEdit} from '@/lib/editor/presets';
import {auroraPresets} from '@/lib/editor/aurora-presets';
import type {GenerationKind} from '@/lib/editor/generation';
import type {Project,Edit} from '@/lib/editor/model';

const galleryCategories=['All','Viral'];
export function PresetsPanel({project,selected,disabled,onApply,onGenerate}:{project:Project;selected?:string;disabled:boolean;onApply:(edit:Edit)=>void;onGenerate:(prompt:string,kind?:GenerationKind)=>void}){
 const [search,setSearch]=useState(''),[galleryCategory,setGalleryCategory]=useState('All'),[effectCategory,setEffectCategory]=useState('All'),[preset,setPreset]=useState(clipPresets[0].id),[auroraId,setAuroraId]=useState(auroraPresets[0]!.id),[target,setTarget]=useState(selected||project.clips[0]?.id||''),[error,setError]=useState(''),[section,setSection]=useState<'ai'|'timeline'>('ai');
 const active=clipPresets.find(p=>p.id===preset)!;
 const selectedAurora=useMemo(()=>auroraPresets.find(p=>p.id===auroraId)||auroraPresets[0]!,[auroraId]);
 const templates=auroraPresets.filter(p=>(galleryCategory==='All'||galleryCategory==='Viral')&&(p.title+' '+p.blurb).toLowerCase().includes(search.toLowerCase()));
 return <div className="preset-library aurora-library">
  <div className="preset-view-tabs"><button className={section==='ai'?'active':''} onClick={()=>setSection('ai')}>AI templates <span>10</span></button><button className={section==='timeline'?'active':''} onClick={()=>setSection('timeline')}>Timeline effects <span>{clipPresets.length}</span></button></div>
  {section==='ai'?<>
   <header className="aurora-heading"><div><span className="aurora-kicker">CODEX STUDIO · PRESET GALLERY</span><h2>Choose a visual direction</h2><p>Pick a look, then open it in Create to review the prompt and provider before generating.</p></div></header>
   <div className="aurora-guide"><span className="aurora-guide-icon">✦</span><div><strong>Keep control of the result</strong><small>Presets prepare a prompt. Nothing is generated or charged until you submit in Create.</small></div><span className="aurora-arrow">↗</span></div>
   <div className="aurora-toolbar"><div className="aurora-categories">{galleryCategories.map(c=><button key={c} className={galleryCategory===c?'active':''} onClick={()=>setGalleryCategory(c)}>{c}</button>)}</div><label className="preset-search"><span className="sr-only">Search presets</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a preset…"/></label></div>
   <div className="aurora-results-heading"><strong>{galleryCategory==='All'?'Featured looks':galleryCategory}</strong><span>{templates.length} presets</span></div>
   <div className="aurora-card-rail">{templates.map(p=><article className={`aurora-template-card ${selectedAurora.id===p.id?'selected':''}`} key={p.id}>
    <button className="aurora-preview-button" onClick={()=>setAuroraId(p.id)} aria-label={`Preview ${p.title}`}><img src={p.thumbnail} alt={`${p.title} preview`} loading="lazy"/><span className="aurora-media-tag">VIDEO</span><span className="aurora-image-count">✦ AI</span><span className="aurora-card-gradient"/><strong>{p.title}</strong></button>
    <p>{p.blurb}</p><div className="aurora-card-actions"><button disabled={disabled} onClick={()=>onGenerate(p.imagePrompt,'image')}>Create image</button><button className="primary-button" disabled={disabled} onClick={()=>onGenerate(p.videoPrompt,'video')}>Create video</button></div>
   </article>)}</div>
   {templates.length===0&&<p className="preset-help">No matching presets. Try another search.</p>}
  </>:<>
   <div className="create-tabs">{['All','Viral','Camera','AI concepts','Cinematic','Surreal','Color','Finishing','Motion','Title','Audio'].map(c=><button key={c} className={effectCategory===c?'active':''} onClick={()=>setEffectCategory(c)}>{c}</button>)}</div>
   <label className="preset-search">Find a timeline effect<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search dream, noir, bloom, motion…"/></label>
   {effectCategory==='AI concepts'?<div className="ai-concept-grid">{creativeTemplates.filter(p=>(p.name+' '+p.description).toLowerCase().includes(search.toLowerCase())).map(p=><article className="preset-apply" key={p.id}><strong>{p.name}</strong><p>{p.description} AI prompt template; review and submit in Create.</p><button className="secondary-button" disabled={disabled} onClick={()=>onGenerate(p.prompt,'video')}>Customize in Create</button></article>)}</div>:<><p className="preset-help">{clipPresets.length} local timeline effects. Applying a look changes the selected clip; use Undo to compare.</p><div className="preset-grid">{clipPresets.filter(p=>(effectCategory==='All'||p.category===effectCategory)&&(p.name+' '+p.description).toLowerCase().includes(search.toLowerCase())).map(p=><button key={p.id} className={`preset-card ${preset===p.id?'chosen':''}`} onClick={()=>setPreset(p.id)}><span className={`preset-swatch swatch-${p.id}`} style={{filter:effectFilters[('effect' in p.patch?p.patch.effect:'none')||'none']}}><i/><b/></span><strong>{p.name}</strong><small>{p.category}</small></button>)}</div><div className="preset-apply"><div><strong>{active.name}</strong><p>{active.description} Applies to the selected clip and is included in export.</p></div><label>Target clip<select value={target} onChange={e=>setTarget(e.target.value)}><option value="">Choose a clip</option>{project.clips.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button className="primary-button" disabled={disabled||!target} onClick={()=>{try{onApply(presetEdit(project,target,preset));setError('')}catch(e){setError((e as Error).message)}}}>Apply preset</button>{error&&<p role="alert">{error}</p>}</div></>}
  </>}
 </div>
}
