import {requireChatGPTUser} from '../chatgpt-auth';
import {requireOwner} from '@/lib/owner';
import {BytePlusEditor} from '@/components/editor/byteplus-editor';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/byteplus');await requireOwner();return <BytePlusEditor/>;}
