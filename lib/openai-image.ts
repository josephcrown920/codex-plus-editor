// OpenAI adapter adapted from the repaired Lantern fork for the Sites runtime.
export async function generateOpenAIImage(apiKey:string,prompt:string,signal:AbortSignal){
 const r=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{authorization:`Bearer ${apiKey}`,'content-type':'application/json'},body:JSON.stringify({model:'gpt-image-1',prompt,n:1,size:'1024x1024',output_format:'png'}),signal});
 if(!r.ok)throw Error(`OpenAI image request failed (HTTP ${r.status}). Check image-model access, verification and API balance.`);
 const d=await r.json() as {data?:{b64_json?:string}[]};const encoded=d.data?.[0]?.b64_json;
 if(!encoded||encoded.length>24*1024*1024)throw Error('OpenAI returned no image or an oversized result');
 const binary=atob(encoded),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
 if(bytes.length<8||![137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b))throw Error('OpenAI returned invalid PNG data');
 return {bytes,requestId:r.headers.get('x-request-id')||undefined};
}
