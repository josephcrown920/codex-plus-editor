export type RouterModel={id:string;name:string;free:boolean};
export async function routerModels(apiKey:string):Promise<RouterModel[]>{
const check=await fetch('https://openrouter.ai/api/v1/key',{headers:{authorization:`Bearer ${apiKey}`},signal:AbortSignal.timeout(20000)});if(!check.ok)throw Error('OpenRouter key could not be verified');
const r=await fetch('https://openrouter.ai/api/v1/models',{headers:{authorization:`Bearer ${apiKey}`},signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('OpenRouter model list unavailable');const d=await r.json() as {data?:{id:string;name:string;supported_parameters?:string[];architecture?:{output_modalities?:string[]};pricing?:{prompt:string;completion:string}}[]};
return (d.data||[]).filter(m=>m.supported_parameters?.includes('tools')&&m.architecture?.output_modalities?.includes('text')).map(m=>({id:m.id,name:m.name,free:!!m.pricing&&Number(m.pricing.prompt)===0&&Number(m.pricing.completion)===0})).sort((a,b)=>a.name.localeCompare(b.name));
}
