import {useEffect,useState} from 'react';import {api,col,day} from '../api';
export default function Student(){const[d,setD]=useState(null);const[m,setM]=useState(false);
 useEffect(()=>{api('/student/me').then(x=>{setD(x);setTimeout(()=>setM(true),60)})},[]);
 if(!d)return <p>Loading…</p>;const p=d.profile;
 return <>{d.alert&&<div className="card r" style={{borderColor:'var(--red)',marginBottom:16}}><b>Attendance warning:</b> your overall attendance is below 75%.</div>}
 <div className="grid"><div className="card" style={{display:'flex',gap:16,alignItems:'center'}}><div className="big" style={{width:72,height:72,borderRadius:'50%',display:'grid',placeItems:'center',background:'linear-gradient(135deg,var(--blue),var(--purple))'}}>{p.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
  <div><h2>{p.name}</h2><div style={{color:'var(--mute)'}}>{p.usn}, {p.department}, semester {p.semester}</div></div></div>
  <div className="card"><h3>Overall attendance</h3><div className="big" style={{color:col(d.overall)}}>{d.overall}%</div><div className="bar"><b style={{width:m?d.overall+'%':0,background:col(d.overall)}}/></div></div>
  <div className="card"><h3>Classes attended / missed</h3><div className="big"><span className="g">{d.attended}</span> / <span className="r">{d.missed}</span></div></div></div><br/>
 <div className="card"><h3>Subject-wise</h3>{d.subjects.map(s=><div key={s.subject_id} style={{margin:'10px 0'}}><div style={{display:'flex',justifyContent:'space-between'}}><span>{s.subject_name}</span><b style={{color:col(s.percentage)}}>{s.percentage}% ({s.attended}/{s.total})</b></div>
  <div className="bar"><b style={{width:m?s.percentage+'%':0,background:col(s.percentage)}}/></div></div>)}{!d.subjects.length&&'No classes recorded yet.'}</div><br/>
 <div className="card tbl"><h3>Attendance history</h3><table><tbody>{d.history.map((h,i)=><tr key={i}><td>{day(h.session_date)}</td><td>{h.subject_name}</td><td className={h.attendance_status==='PRESENT'?'g':h.attendance_status==='ABSENT'?'r':'y'}>{h.attendance_status}</td></tr>)}</tbody></table></div></>}
