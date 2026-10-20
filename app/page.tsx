import Editor from '@/components/editor/editor';
import {requireChatGPTUser} from './chatgpt-auth';
import {requireOwner} from '@/lib/owner';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/');try{await requireOwner();}catch{return <main style={{padding:48,color:'white'}}>This is a personal Codex Studio workspace. Sign in with the account that owns this site.</main>;}return <Editor/>;}
