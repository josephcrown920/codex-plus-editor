import { env } from 'cloudflare:workers';
export function storage(){if(!env.DB||!env.BUCKET)throw Error('Project storage is unavailable');return {db:env.DB,bucket:env.BUCKET};}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw Error('Invalid origin');}
export const jsonError=(e:unknown,status=400)=>Response.json({error:e instanceof Error?e.message:'Request failed'},{status});
