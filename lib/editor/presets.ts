import type {Clip,Project,Edit} from './model';
export const clipPresets=[
{id:'golden-hour',name:'Golden hour',category:'Color',description:'A warm, saturated grade.',patch:{effect:'warm'}},
{id:'noir',name:'Midnight noir',category:'Color',description:'High-contrast black and white.',patch:{effect:'noir'}},
{id:'cinema',name:'Cinema',category:'Color',description:'Subdued saturation and deeper contrast.',patch:{effect:'cinema'}},
{id:'vivid',name:'Vivid',category:'Color',description:'More color and contrast.',patch:{effect:'vivid'}},
{id:'vintage',name:'Vintage',category:'Color',description:'A soft sepia treatment.',patch:{effect:'vintage'}},
{id:'soft',name:'Soft focus',category:'Color',description:'A subtle soft-focus finish.',patch:{effect:'soft'}},
{id:'slow-push',name:'Slow push',category:'Motion',description:'A gradual zoom with soft boundaries.',patch:{motion:'zoom-in',fade:.4}},
{id:'pull-back',name:'Pull back',category:'Motion',description:'Ease out of a close framing.',patch:{motion:'zoom-out',fade:.4}},
{id:'pan-left',name:'Pan left',category:'Motion',description:'Move the framing across the clip.',patch:{motion:'pan-left'}},
{id:'fade',name:'Soft reveal',category:'Motion',description:'Fade in and out over 0.6 seconds.',patch:{fade:.6}},
{id:'title-gold',name:'Gold lower title',category:'Title',description:'A gold title placed below center.',patch:{color:'#e1c17a',fontSize:56,y:30,fade:.4}},
{id:'title-bold',name:'Bold headline',category:'Title',description:'A large centered white headline.',patch:{color:'#ffffff',fontSize:90,y:0,fade:.25}},
{id:'audio-bed',name:'Background bed',category:'Audio',description:'Set background audio to 30%.',patch:{volume:.3}},
{id:'audio-full',name:'Full level',category:'Audio',description:'Return the clip’s volume to 100%.',patch:{volume:1}},
{id:'reset-look',name:'Original look',category:'Color',description:'Clear color, movement, and fades.',patch:{effect:'none',motion:'none',fade:0}}
] satisfies {id:string;name:string;category:string;description:string;patch:Partial<Clip>}[];
export type PresetId=typeof clipPresets[number]['id'];
export function presetEdit(project:Project,clipId:string,presetId:string):Edit{const c=project.clips.find(c=>c.id===clipId);if(!c)throw Error('Select a clip first');const p=clipPresets.find(p=>p.id===presetId);if(!p)throw Error('Unknown preset');const t=project.tracks.find(t=>t.id===c.trackId);if(!t||t.locked)throw Error('Choose an unlocked clip');if(p.category==='Title'&&t.kind!=='text')throw Error('This preset needs a title clip');if(p.category==='Audio'&&t.kind==='text')throw Error('This preset needs a clip with audio');if(['Color','Motion'].includes(p.category)&&t.kind==='audio')throw Error('Choose a visual clip');return {type:'update',clipId,patch:p.patch};}
