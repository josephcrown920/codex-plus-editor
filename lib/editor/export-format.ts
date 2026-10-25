export const exportMimeCandidates={webm:['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'],mp4:['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4']} as const;
export function supportedExportMime(format:'webm'|'mp4',supports:(mime:string)=>boolean){return exportMimeCandidates[format].find(mime=>supports(mime));}
