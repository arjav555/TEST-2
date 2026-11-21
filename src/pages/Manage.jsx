import {useEffect,useState} from 'react';import {Link} from 'react-router-dom';import {api} from '../api';
const E={usn:'',name:'',email:'',department:'CSE',semester:3};
export default function Manage(){const[tab,setTab]=useState('students');
 return <><div className="tabs">{['students','faculty','subjects'].map(t=><button key={t} className={'btn'+(tab===t?'':' ghost')} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>
 {tab==='students'?<Students/>:tab==='faculty'?<Faculty/>:<Subjects/>}</>}
function Students(){const[rows,setRows]=useState([]);const[q,setQ]=useState('');const[f,setF]=useState(E);const[eid,setEid]=useState(null);const[err,setErr]=useState('');
 const load=()=>api('/students?search='+encodeURIComponent(q)).then(setRows);useEffect(()=>{load()},[q]);
 const set=k=>e=>setF({...f,[k]:e.target.value});
 async function save(e){e.preventDefault();setErr('');const body={...f,semester:+f.semester};
  try{eid?await api('/students/'+eid,{method:'PUT',body}):await api('/students',{method:'POST',body});setF(E);setEid(null);load()}catch(x){setErr(x.message)}}
 const del=async id=>{if(confirm('Delete this student and their face data?')){await api('/students/'+id,{method:'DELETE'});load()}};
 return <><form className="card" onSubmit={save}><h3>{eid?'Edit student':'Add student'}</h3><div className="grid">
  <input placeholder="USN" value={f.usn} onChange={set('usn')} disabled={!!eid} required/><input placeholder="Name" value={f.name} onChange={set('name')} required/>
  <input type="email" placeholder="Email" value={f.email} onChange={set('email')} required/><input placeholder="Department" value={f.department} onChange={set('department')} required/>
  <input type="number" min="1" max="8" placeholder="Semester" value={f.semester} onChange={set('semester')} required/>
  <div><button className="btn">{eid?'Save changes':'Add student'}</button>{eid&&<button type="button" className="btn ghost" onClick={()=>{setEid(null);setF(E)}}>Cancel</button>}</div></div>{err&&<p className="err">{err}</p>}</form><br/>
  <div className="card"><input placeholder="Search name or USN" value={q} onChange={e=>setQ(e.target.value)}/><div className="tbl"><table><thead><tr><th>USN</th><th>Name</th><th>Dept</th><th>Sem</th><th>Face data</th><th/></tr></thead><tbody>
  {rows.map(s=><tr key={s.student_id}><td>{s.usn}</td><td>{s.name}</td><td>{s.department}</td><td>{s.semester}</td><td className={s.face_enrolled?'g':'y'}>{s.face_enrolled?'Enrolled':'Not enrolled'}</td>
   <td><a href="#" onClick={e=>{e.preventDefault();setEid(s.student_id);setF(s)}}>Edit</a> · <Link to={'/enroll?sid='+s.student_id}>{s.face_enrolled?'Re-enroll':'Enroll'}</Link> · <a href="#" onClick={e=>{e.preventDefault();del(s.student_id)}}>Delete</a></td></tr>)}</tbody></table></div></div></>}
function Faculty(){const[rows,setRows]=useState([]);const[f,setF]=useState({name:'',email:'',department:'CSE'});const[err,setErr]=useState('');
 const load=()=>api('/faculty').then(setRows);useEffect(()=>{load()},[]);
 async function add(e){e.preventDefault();setErr('');try{await api('/faculty',{method:'POST',body:f});setF({name:'',email:'',department:'CSE'});load()}catch(x){setErr(x.message)}}
 const del=async id=>{if(confirm('Delete this faculty member?'))try{await api('/faculty/'+id,{method:'DELETE'});load()}catch(x){setErr(x.message)}};
 return <><form className="card" onSubmit={add}><h3>Add faculty</h3><div className="grid"><input placeholder="Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})} required/>
  <input type="email" placeholder="Email (login = part before @, password faculty123)" value={f.email} onChange={e=>setF({...f,email:e.target.value})} required/>
  <input placeholder="Department" value={f.department} onChange={e=>setF({...f,department:e.target.value})} required/><div><button className="btn">Add faculty</button></div></div>{err&&<p className="err">{err}</p>}</form><br/>
  <div className="card tbl"><table><thead><tr><th>Name</th><th>Email</th><th>Dept</th><th/></tr></thead><tbody>{rows.map(r=><tr key={r.faculty_id}><td>{r.name}</td><td>{r.email}</td><td>{r.department}</td><td><a href="#" onClick={e=>{e.preventDefault();del(r.faculty_id)}}>Delete</a></td></tr>)}</tbody></table></div></>}
function Subjects(){const[rows,setRows]=useState([]);const[fac,setFac]=useState([]);const[stu,setStu]=useState([]);const[f,setF]=useState({subject_code:'',subject_name:'',faculty_id:''});const[es,setEs]=useState('');const[sel,setSel]=useState([]);const[msg,setMsg]=useState('');
 const load=()=>api('/subjects').then(s=>{setRows(s);setEs(v=>v||s[0]?.subject_id||'')});
 useEffect(()=>{load();api('/faculty').then(x=>{setFac(x);setF(v=>({...v,faculty_id:x[0]?.faculty_id||''}))});api('/students').then(setStu)},[]);
 async function add(e){e.preventDefault();setMsg('');try{await api('/subjects',{method:'POST',body:{...f,faculty_id:+f.faculty_id}});setF({...f,subject_code:'',subject_name:''});load()}catch(x){setMsg(x.message)}}
 async function enroll(){try{await api(`/subjects/${es}/enroll`,{method:'POST',body:{student_ids:sel.map(Number)}});setMsg('Students enrolled.');load()}catch(x){setMsg(x.message)}}
 return <><form className="card" onSubmit={add}><h3>Add subject</h3><div className="grid"><input placeholder="Code (e.g. CS304)" value={f.subject_code} onChange={e=>setF({...f,subject_code:e.target.value})} required/>
  <input placeholder="Subject name" value={f.subject_name} onChange={e=>setF({...f,subject_name:e.target.value})} required/>
  <select value={f.faculty_id} onChange={e=>setF({...f,faculty_id:e.target.value})}>{fac.map(x=><option key={x.faculty_id} value={x.faculty_id}>{x.name}</option>)}</select><div><button className="btn">Add subject</button></div></div></form><br/>
  <div className="card"><h3>Enroll students in a subject (Ctrl/Cmd-click for several)</h3><select value={es} onChange={e=>setEs(e.target.value)}>{rows.map(s=><option key={s.subject_id} value={s.subject_id}>{s.subject_code} · {s.subject_name}</option>)}</select>
   <select multiple size="6" value={sel} onChange={e=>setSel([...e.target.selectedOptions].map(o=>o.value))}>{stu.map(s=><option key={s.student_id} value={s.student_id}>{s.usn} · {s.name}</option>)}</select>
   <button className="btn" onClick={enroll}>Enroll selected</button>{msg&&<p>{msg}</p>}</div><br/>
  <div className="card tbl"><table><thead><tr><th>Code</th><th>Subject</th><th>Faculty</th><th>Enrolled</th></tr></thead><tbody>{rows.map(r=><tr key={r.subject_id}><td>{r.subject_code}</td><td>{r.subject_name}</td><td>{r.faculty_name}</td><td>{r.enrolled}</td></tr>)}</tbody></table></div></>}
