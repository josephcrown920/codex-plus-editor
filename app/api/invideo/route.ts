import {z} from 'zod';
import {requireOwner} from '@/lib/owner';
import {sameOrigin,jsonError} from '@/lib/server-store';
import {getConnection,removeConnection} from '@/lib/ai-connection';
import {startInvideo,pollInvideo,invideoRead} from '@/lib/invideo';
export async function GET(){try{await requireOwner();return Response.json({connected:!!await getConnection('invideo')});}catch(e){return jsonError(e);}}
export async function POST(req:Request){try{await requireOwner();sameOrigin(req);const v=z.object({action:z.enum(['start','poll','projects','help','disconnect'])}).parse(await req.json());if(v.action==='start')return Response.json(await startInvideo());if(v.action==='poll')return Response.json(await pollInvideo());if(v.action==='disconnect'){await removeConnection('invideo');await removeConnection('invideo-pending');return Response.json({connected:false})}return Response.json(await invideoRead(v.action==='projects'?'list_projects':'get_help'));}catch(e){return jsonError(e);}}
