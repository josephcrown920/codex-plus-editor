import {getChatGPTUser} from '@/app/chatgpt-auth';
// Compatibility name: every signed-in customer may enter their own workspace.
export async function requireOwner(){const user=await getChatGPTUser();if(!user)throw Error('Sign in with ChatGPT to use your workspace');return user;}
