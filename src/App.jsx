import {createContext,useContext,useEffect,useState} from 'react';
import {BrowserRouter,Routes,Route,Navigate,NavLink,useNavigate} from 'react-router-dom';
import {api} from './api';
import Landing from './pages/Landing';import Dashboard from './pages/Dashboard';import Manage from './pages/Manage';
import Enroll from './pages/Enroll';import Live from './pages/Live';import Student from './pages/Student';
export const Auth=createContext();export const useAuth=()=>useContext(Auth);
const LINKS={ADMIN:[['/dashboard','Dashboard'],['/manage','Manage'],['/enroll','Face enrollment']],
 FACULTY:[['/dashboard','Dashboard'],['/live','Live attendance']],STUDENT:[['/student','My attendance'],['/enroll','Face enrollment']]};
function Shell({roles,children}){const{me,setMe}=useAuth();const nav=useNavigate();
 if(me===undefined)return <main>Loading…</main>;
 if(!me?.role||!roles.includes(me.role))return <Navigate to="/" replace/>;
 return <><nav><span className="logo">FACE<i>PULSE</i></span>{LINKS[me.role].map(([to,t])=><NavLink key={to} to={to}>{t}</NavLink>)}
  <span className="pill">{me.role}</span><button onClick={async()=>{await api('/logout',{method:'POST'});setMe(null);nav('/')}}>Log out</button></nav><main>{children}</main></>}
export default function App(){const[me,setMe]=useState();
 useEffect(()=>{api('/me').then(setMe).catch(()=>setMe(null))},[]);
 const S=(roles,el)=><Shell roles={roles}>{el}</Shell>;
 return <Auth.Provider value={{me,setMe}}><BrowserRouter><Routes>
  <Route path="/" element={<Landing/>}/>
  <Route path="/dashboard" element={S(['ADMIN','FACULTY'],<Dashboard/>)}/>
  <Route path="/manage" element={S(['ADMIN'],<Manage/>)}/>
  <Route path="/live" element={S(['FACULTY'],<Live/>)}/>
  <Route path="/enroll" element={S(['ADMIN','STUDENT'],<Enroll/>)}/>
  <Route path="/student" element={S(['STUDENT'],<Student/>)}/>
  <Route path="*" element={<Navigate to="/" replace/>}/></Routes></BrowserRouter></Auth.Provider>}
