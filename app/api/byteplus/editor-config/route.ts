import {requireOwner} from '@/lib/owner';
import {getConnection} from '@/lib/ai-connection';
import {jsonError} from '@/lib/server-store';
export async function GET(){try{await requireOwner();const c=await getConnection('amk');return Response.json({configured:!!c?.endpoint&&!!c?.projectId&&!!c?.licenseUrl,projectId:c?.projectId,licenseUrl:c?.licenseUrl},{headers:{'cache-control':'private, no-store'}});}catch(e){return jsonError(e,403);}}
