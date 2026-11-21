export async function api(p,o={}){
  const r=await fetch('/api'+p,{credentials:'same-origin',method:o.method||'GET',headers:{'Content-Type':'application/json'},body:o.body?JSON.stringify(o.body):undefined});
  let d={};try{d=await r.json()}catch{}
  if(!r.ok)throw new Error(d.error||r.statusText);return d}
export const home=r=>r==='STUDENT'?'/student':'/dashboard';
export const col=p=>p>85?'var(--green)':p>=75?'var(--amber)':'var(--red)';
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const day=d=>String(d).slice(0,10);
export async function startCam(v){v.srcObject=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480}});await v.play()}
export const stopCam=v=>v?.srcObject?.getTracks().forEach(t=>t.stop());
export function frame(v){const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL('image/jpeg',.85)}
export function draw(cv,v,boxes){cv.width=v.videoWidth||640;cv.height=v.videoHeight||480;const x=cv.getContext('2d');x.lineWidth=3;x.font='bold 18px Sora,sans-serif';
  boxes.forEach(b=>{const[a,c,d,e]=b.bbox;x.strokeStyle=x.fillStyle=b.color;x.strokeRect(a,c,d-a,e-c);x.fillText(b.text,a,Math.max(18,c-8))})}
