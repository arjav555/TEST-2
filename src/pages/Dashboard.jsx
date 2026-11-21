import {useEffect,useState} from 'react';import {Line,Bar,Doughnut} from 'react-chartjs-2';
import {Chart as C,CategoryScale,LinearScale,BarElement,LineElement,PointElement,ArcElement,Tooltip,Legend,Filler} from 'chart.js';
import {api,day} from '../api';import {useAuth} from '../App';
C.register(CategoryScale,LinearScale,BarElement,LineElement,PointElement,ArcElement,Tooltip,Legend,Filler);C.defaults.color='#8d97c4';C.defaults.borderColor='rgba(120,140,255,.12)';
const ds=(label,data,c='#3b82ff')=>({label,data,backgroundColor:c,borderColor:c,tension:.35});
export default function Dashboard(){const{me}=useAuth();const[a,setA]=useState(null);const[rows,setRows]=useState([]);const[subs,setSubs]=useState([]);const[f,setF]=useState({date:'',subject_id:''});
 const load=()=>api('/analytics').then(setA);
 const loadRows=()=>{const p=new URLSearchParams();Object.entries(f).forEach(([k,v])=>v&&p.set(k,v));api('/attendance?'+p).then(setRows)};
 useEffect(()=>{load();api('/subjects').then(setSubs)},[]);useEffect(loadRows,[f]);
 if(!a)return <p>Loading analytics…</p>;
 const t=a.totals,d=a.daily.map(x=>day(x.d)),P=a.daily.reduce((s,x)=>s+x.present,0),A=a.daily.reduce((s,x)=>s+x.absent,0);
 const kpi=[['Students',t.students],['Faculty',t.faculty],['Subjects',t.subjects],['Sessions',t.sessions],["Today's attendance",a.today_pct==null?'No sessions today':a.today_pct+'%'],['Below 75%',a.below_75.length]];
 const del=async id=>{if(confirm('Delete this record?')){await api('/attendance/'+id,{method:'DELETE'});loadRows();load()}};
 return <><div className="grid">{kpi.map(([k,v])=><div className="card" key={k}><h3>{k}</h3><div className="big">{v}</div></div>)}</div><br/>
 <div className="grid"><div className="card"><h3>Daily attendance %</h3><Line data={{labels:d,datasets:[ds('%',a.daily.map(x=>x.pct))]}}/></div>
  <div className="card"><h3>Subject-wise %</h3><Bar data={{labels:a.by_subject.map(x=>x.subject_code),datasets:[ds('%',a.by_subject.map(x=>x.pct),'#8b5cf6')]}}/></div>
  <div className="card"><h3>Present vs absent</h3><Doughnut data={{labels:['Present','Absent'],datasets:[{data:[P,A],backgroundColor:['#22ff9a','#ff4d6d'],borderWidth:0}]}}/></div>
  <div className="card"><h3>Monthly %</h3><Bar data={{labels:a.monthly.map(x=>x.m),datasets:[ds('%',a.monthly.map(x=>x.pct))]}}/></div></div><br/>
 <div className="grid"><div className="card"><h3>Students below 75%</h3>{a.below_75.map(s=><div key={s.usn}>{s.usn} {s.name} <b className="r">{s.pct}%</b></div>)}{!a.below_75.length&&'Everyone is at 75% or above.'}</div>
  <div className="card"><h3>Recently recognized</h3>{a.recent.map((s,i)=><div key={i}>{s.name} <span className="pill">{s.recognition_confidence}</span></div>)}{!a.recent.length&&'No recognitions yet.'}</div></div><br/>
 <div className="card"><h3>Attendance records</h3><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
  <input type="date" style={{width:'auto'}} value={f.date} onChange={e=>setF({...f,date:e.target.value})}/>
  <select style={{width:'auto'}} value={f.subject_id} onChange={e=>setF({...f,subject_id:e.target.value})}><option value="">All subjects</option>{subs.map(s=><option key={s.subject_id} value={s.subject_id}>{s.subject_code}</option>)}</select>
  <a className="btn ghost" style={{height:'fit-content',marginTop:4}} href="/api/reports/export">Export CSV</a></div>
  <div className="tbl"><table><thead><tr><th>Date</th><th>USN</th><th>Name</th><th>Subject</th><th>Status</th><th>Similarity</th><th/></tr></thead><tbody>
  {rows.map(r=><tr key={r.attendance_id}><td>{day(r.session_date)}</td><td>{r.usn}</td><td>{r.name}</td><td>{r.subject_code}</td>
   <td className={r.attendance_status==='PRESENT'?'g':r.attendance_status==='ABSENT'?'r':'y'}>{r.attendance_status}</td><td>{r.recognition_confidence??'manual'}</td>
   <td>{me.role==='ADMIN'&&<a href="#" onClick={e=>{e.preventDefault();del(r.attendance_id)}}>Delete</a>}</td></tr>)}</tbody></table></div></div></>}
