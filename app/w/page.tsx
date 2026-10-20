import Editor from '@/components/editor/editor';
import {requireChatGPTUser} from '../chatgpt-auth';
import {requireOwner} from '@/lib/owner';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/w');try{await requireOwner();}catch{return <main style={{padding:48,color:'white'}}>This workspace belongs to another account.</main>;}return <Editor/>;}
