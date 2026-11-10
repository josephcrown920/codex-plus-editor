import Editor from '@/components/editor/editor';
import {requireChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/w');return <Editor/>;}
