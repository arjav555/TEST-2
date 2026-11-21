import {useEffect,useRef,useState} from 'react';import {useSearchParams} from 'react-router-dom';
import {api,startCam,stopCam,frame,draw,sleep} from '../api';import {useAuth} from '../App';
const STEPS=[['Look straight at the camera',3],['Slowly turn your head left',3],['Slowly turn your head right',3]];
export default function Enroll(){const{me}=useAuth();const[sp]=useSearchParams();const v=useRef(),o=useRef();
 const[list,setList]=useState([]);const[sid,setSid]=useState(me.role==='STUDENT'?me.ref_id:+sp.get('sid')||0);
 const[ok,setOk]=useState(false);const[msg,setMsg]=useState('Waiting to start.');const[pct,setPct]=useState(0);const[info,setInfo]=useState('');const[busy,setBusy]=useState(false);
 useEffect(()=>{if(me.role==='ADMIN')api('/students').then(l=>{setList(l);setSid(s=>s||l[0]?.student_id||0)});return()=>stopCam(v.current)},[]);
 async function start(){
  if(!ok)return alert('Consent is required before biometric enrollment.');setBusy(true);setPct(0);
  try{await startCam(v.current)}catch{setMsg('Camera blocked. Allow camera access in the browser and retry.');setBusy(false);return}
  const frames=[],total=STEPS.reduce((a,s)=>a+s[1],0);
  for(const[txt,n]of STEPS){setMsg(txt);await sleep(2500);
   for(let i=0;i<n;){const vv=v.current;if(!vv?.videoWidth){await sleep(300);continue}let c;
    try{c=await api('/enroll/check',{method:'POST',body:{frame:frame(vv)}})}catch(e){setInfo('Server error: '+e.message);await sleep(1500);continue}
    if(c.detected){const good=c.quality.ok&&c.centered;draw(o.current,vv,[{bbox:c.bbox,color:good?'#22ff9a':'#fbbf24',text:good?'Face detected':c.quality.ok?'Center your face':'Improve lighting / move closer'}]);
     setInfo(`Quality: sharpness ${c.quality.sharpness}, size ${c.quality.face_px}px, score ${c.quality.det_score}`);
     if(good){frames.push(frame(vv));i++;setPct(100*frames.length/total);await sleep(500)}}
    else{draw(o.current,vv,[]);setInfo(c.faces?`${c.faces} faces detected. Only one person should be in frame.`:'No face found. Face a light, sit an arm\'s length away, remove cap/mask.')}
    await sleep(250)}}
  setMsg('Generating face template…');
  try{const r=await api('/enroll/'+sid,{method:'POST',body:{consent:true,frames}});setMsg(`Face successfully enrolled (${r.samples} samples, ${r.model})`)}catch(e){setMsg('Failed: '+e.message)}
  stopCam(v.current);setBusy(false)}
 return <div className="split"><div className="cam"><video ref={v} muted playsInline/><canvas ref={o}/></div>
  <div className="card"><h2>Face enrollment</h2><br/>
  {me.role==='ADMIN'&&<><label>Student</label><select value={sid} onChange={e=>setSid(+e.target.value)}>{list.map(s=><option key={s.student_id} value={s.student_id}>{s.usn} · {s.name}</option>)}</select></>}
  <label style={{display:'flex',gap:8,margin:'10px 0'}}><input type="checkbox" style={{width:'auto',margin:'3px 0'}} checked={ok} onChange={e=>setOk(e.target.checked)}/>I consent to my facial data being stored as an encrypted numerical template for attendance. No photos are saved.</label>
  <button className="btn go" disabled={busy||!sid} onClick={start}>Start enrollment</button><br/><br/>
  <h3>{msg}</h3><div className="bar"><b style={{width:pct+'%',background:'var(--green)'}}/></div><p className="feed" style={{marginTop:10}}>{info}</p></div></div>}
