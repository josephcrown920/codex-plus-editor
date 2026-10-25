import {emptyTimeline,clipFromAsset} from './editor';
import type {Project} from '../editor/model';
import type {TimelineTrack} from './types';
export function lanternProjectExport(project:Project){
 const document=emptyTimeline(project.id,project.ratio,'1080p');
 document.tracks=project.tracks.map(track=>({id:track.id,kind:track.kind==='text'?'title':track.kind,name:track.name,muted:track.muted,locked:track.locked,clips:project.clips.filter(c=>c.trackId===track.id).map(c=>({
  ...clipFromAsset(c.assetId||'',Math.round(c.start*1000),Math.round(c.duration*1000)),id:c.id,assetId:c.assetId||null,
  inMs:Math.round(c.offset*1000),outMs:Math.round((c.offset+c.duration*(c.speed||1))*1000),
  transform:{x:c.x,y:c.y,scale:c.scale,rotate:0,opacity:c.opacity},volume:c.volume,speed:c.speed||1,text:c.text,
  style:{codexStudio:{...c},hidden:track.hidden},effects:c.effect&&c.effect!=='none'?[{id:c.effect,params:{}}]:[],
 }))} as TimelineTrack));
 return {format:'codex-studio/lantern-interchange',version:1,document,assets:project.assets,sourceProject:project,
 notes:['Timeline values are milliseconds. Transform x/y retain Codex percentage coordinates.','Codex-specific fields are retained in clip style.codexStudio and sourceProject; the original Lantern renderer does not implement them.','Media references require owner access; media bytes are not embedded. No standalone Lantern importer is verified.']};
}
