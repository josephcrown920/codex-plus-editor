import {z} from 'zod';
import {requireOwner} from '@/lib/owner';
import {sameOrigin,jsonError} from '@/lib/server-store';
import {getConnection,setConnection,removeConnection} from '@/lib/ai-connection';
export async function GET(){try{await requireOwner();return Response.json({connected:!!await getConnection('fal')});}catch(e){return jsonError(e,403);}}
export async function POST(req:Request){try{await requireOwner();sameOrigin(req);const {apiKey}=z.object({apiKey:z.string().trim().min(16).max(500).regex(/^[^\r\n]+$/)}).parse(await req.json());await setConnection({apiKey,models:[],model:'fal'},'fal');return Response.json({connected:true,note:'Key saved. Model access and balance are checked by fal when a job is submitted.'});}catch(e){return jsonError(e);}}
export async function DELETE(req:Request){try{await requireOwner();sameOrigin(req);await removeConnection('fal');return Response.json({connected:false});}catch(e){return jsonError(e);}}
