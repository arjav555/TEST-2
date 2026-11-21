import {useEffect,useRef,useState} from 'react';import {api,startCam,stopCam,frame,draw,sleep} from '../api';
const COL={recognized:'#22ff9a',uncertain:'#fbbf24',needs_liveness:'#3b82ff',unknown:'#ff4d6d'};
export default function Live(){const v=useRef(),o=useRef(),run=useRef(false);
 const[subs,setSubs]=useState([]);const[sub,setSub]=useState('');const[sid,setSid]=useState(null);const[on,setOn]=useState(false);const[st,setSt]=useState(null);const[log,setLog]=useState([]);const[unk,setUnk]=useState(0);const[err,setErr]=useState('');
 useEffect(()=>{api('/subjects').then(s=>{setSubs(s);setSub(s[0]?.subject_id||'')});return()=>{run.current=false;stopCam(v.current)}},[]);
 const add=t=>setLog(l=>[`${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} – ${t}`,...l].slice(0,50));
 const refresh=id=>api(`/sessions/${id}/status`).then(setSt).catch(()=>{});
 async function start(){setErr('');try{await startCam(v.current)}catch{return setErr('Camera blocked. Allow camera access and retry.')}
  let id;try{id=(await api('/sessions',{method:'POST',body:{subject_id:+sub}})).session_id}catch(e){stopCam(v.current);return setErr(e.message)}
  setSid(id);setOn(true);run.current=true;setUnk(0);add('Session started');refresh(id);let tick=0,u=0;
  while(run.current){try{const r=await api(`/sessions/${id}/recognize`,{method:'POST',body:{frame:frame(v.current)}});
   draw(o.current,v.current,r.faces.map(f=>({bbox:f.bbox,color:COL[f.status],text:f.status==='unknown'?f.label:`${f.name} · ${f.usn}`+(f.status==='recognized'?' ✓':` (${f.label})`)})));
   const fresh=r.faces.filter(f=>f.new&&f.status==='recognized');fresh.forEach(f=>add(`${f.name} recognized (similarity ${f.similarity})`));
   u=Math.max(u,r.unknown);setUnk(u);if(fresh.length||++tick%4===0)refresh(id)}catch(e){add('Error: '+e.message)}await sleep(300)}}
 async function stop(){if(!confirm('Finalize attendance? Everyone not recognized is marked absent.'))return;run.current=false;await sleep(700);
  try{await api(`/sessions/${sid}/stop`,{method:'POST'})}catch(e){setErr(e.message)}stopCam(v.current);draw(o.current,v.current,[]);await refresh(sid);add('Session finalized');setOn(false)}
 const setA=async(student_id,status)=>{await api('/attendance',{method:'PUT',body:{student_id,session_id:sid,status}});refresh(sid)};
 const rows=st?.students||[];
 return <div className="split"><div><div style={{display:'flex',gap:10,alignItems:'end',flexWrap:'wrap'}}><div style={{flex:1,minWidth:180}}><label>Subject</label>
  <select value={sub} disabled={on} onChange={e=>setSub(e.target.value)}>{subs.map(s=><option key={s.subject_id} value={s.subject_id}>{s.subject_code} · {s.subject_name}</option>)}</select></div>
  <button className="btn go" style={{marginBottom:10}} disabled={on||!sub} onClick={start}>Start session</button><button className="btn stop" style={{marginBottom:10}} disabled={!on} onClick={stop}>Finalize</button></div>
  {err&&<p className="err">{err}</p>}<div className="cam"><video ref={v} muted playsInline/><canvas ref={o}/></div>
  <p style={{color:'var(--mute)',marginTop:8}}>Each student should turn their head slightly once so liveness can be confirmed.</p></div>
  <div className="stack"><div className="card"><h3>Session statistics</h3><div className="grid" style={{gridTemplateColumns:'repeat(2,1fr)'}}>
   <div>Total<div className="big">{st?.total??0}</div></div><div>Present<div className="big g">{st?.present??0}</div></div>
   <div>Absent<div className="big r">{st?st.total-st.present-st.pending:0}</div></div><div>Avg similarity<div className="big">{st?.avg_similarity??'–'}</div></div></div></div>
   <div className="card"><h3>Recognized students</h3><div className="feed">{rows.filter(x=>x.attendance_status==='PRESENT').map(x=><div key={x.student_id}>{x.name} – {x.usn} – <b className="g">PRESENT</b></div>)}</div></div>
   <div className="card"><h3>Needs review</h3><div className="feed">{rows.filter(x=>x.attendance_status==='PENDING_REVIEW').map(x=><div key={x.student_id}>{x.name} ({x.recognition_confidence}) <a href="#" className="g" onClick={e=>{e.preventDefault();setA(x.student_id,'PRESENT')}}>Accept</a> · <a href="#" className="r" onClick={e=>{e.preventDefault();setA(x.student_id,'ABSENT')}}>Reject</a></div>)}</div></div>
   <div className="card"><h3>Unknown faces: {unk}</h3><div className="feed">{log.map((l,i)=><div key={i}>{l}</div>)}</div></div></div></div>}
