import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export async function requireOwner(){const user=await getChatGPTUser();if(!user)throw Error('Sign in with ChatGPT to use your workspace');if(!env.AURORA_OWNER_EMAIL||user.email.toLowerCase()!==env.AURORA_OWNER_EMAIL.toLowerCase())throw Error('This workspace belongs to another account');return user;}
