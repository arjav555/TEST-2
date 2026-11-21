import {useEffect,useState} from 'react';import {useNavigate} from 'react-router-dom';import {api,home} from '../api';import {useAuth} from '../App';
export default function Landing(){const{me,setMe}=useAuth();const nav=useNavigate();const[u,setU]=useState('');const[p,setP]=useState('');const[err,setErr]=useState('');
 useEffect(()=>{if(me?.role)nav(home(me.role),{replace:true})},[me]);
 async function submit(e){e.preventDefault();setErr('');try{setMe(await api('/login',{method:'POST',body:{username:u,password:p}}))}catch(x){setErr(x.message)}}
 return <><nav><span className="logo">FACE<i>PULSE</i></span></nav><main className="hero"><div>
  <h1>ATTENDANCE, REIMAGINED BY AI.</h1><p>Intelligent facial recognition. Automated attendance. Real-time insights.</p>
  <form className="card" onSubmit={submit}><h3>Sign in (Admin, Faculty or Student)</h3>
   <label>Username</label><input value={u} onChange={e=>setU(e.target.value)} required autoComplete="username"/>
   <label>Password</label><input type="password" value={p} onChange={e=>setP(e.target.value)} required autoComplete="current-password"/>
   {err&&<p className="err">{err}</p>}<button className="btn" style={{width:'100%'}}>Launch dashboard</button>
   <p style={{fontSize:12,color:'var(--mute)',marginTop:10}}>Demo: admin / admin123 · faculty1 / faculty123 · 1ms24cs001 / student123</p></form></div>
  <div className="scan" aria-hidden="true"><svg viewBox="0 0 100 130" fill="none" stroke="#3b82ff" strokeWidth="1.5"><ellipse cx="50" cy="62" rx="32" ry="42"/><circle cx="37" cy="52" r="4"/><circle cx="63" cy="52" r="4"/><path d="M50 58v16m-9 14q9 7 18 0M18 48q4-26 32-26t32 26" stroke="#8b5cf6"/></svg><div className="tag">1MS24CS001 · Arjun Nair · match 0.71</div></div></main></>}
