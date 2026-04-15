import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// WEDDINGPLAN v2 — Wedding Coordinator PWA
// Full CRUD, photos, WhatsApp share, guest list, comparisons
// ═══════════════════════════════════════════════════════════════

const DB_NAME = "weddingplan_db";
const DB_VER = 3;
const STORES = ["projects","prestateurs","calls","tasks","dday","moodboard","guests","notes","photos"];

function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,DB_VER);r.onupgradeneeded=(e)=>{const db=e.target.result;STORES.forEach(s=>{if(!db.objectStoreNames.contains(s))db.createObjectStore(s,{keyPath:"id"});});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);})}
async function dbAll(s){const db=await openDB();return new Promise((r,j)=>{const t=db.transaction(s,"readonly");const q=t.objectStore(s).getAll();q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error);})}
async function dbPut(s,item){const db=await openDB();return new Promise((r,j)=>{const t=db.transaction(s,"readwrite");t.objectStore(s).put(item);t.oncomplete=()=>r(item);t.onerror=()=>j(t.error);})}
async function dbDel(s,id){const db=await openDB();return new Promise((r,j)=>{const t=db.transaction(s,"readwrite");t.objectStore(s).delete(id);t.oncomplete=()=>r();t.onerror=()=>j(t.error);})}

const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const today=()=>new Date().toISOString().slice(0,10);

const TYPES=[
  {id:"venue",label:"Lieu",icon:"🏛️",color:"#C9A84C"},
  {id:"music",label:"Musique",icon:"🎵",color:"#8B3A44"},
  {id:"neggafa",label:"Neggafa",icon:"👑",color:"#D4AF37"},
  {id:"makeup",label:"Maquillage",icon:"💄",color:"#E88D9D"},
  {id:"catering",label:"Traiteur",icon:"🍽️",color:"#2D6A4F"},
  {id:"photo",label:"Photo/Vidéo",icon:"📸",color:"#5B4A8A"},
  {id:"decoration",label:"Décoration",icon:"🌸",color:"#D4A574"},
  {id:"flowers",label:"Fleurs",icon:"💐",color:"#C06C84"},
  {id:"cake",label:"Pâtisserie",icon:"🎂",color:"#E8A87C"},
  {id:"henna",label:"Henné",icon:"✋",color:"#B85C38"},
  {id:"transport",label:"Transport",icon:"🚗",color:"#34495E"},
  {id:"other",label:"Autre",icon:"✨",color:"#8B7E74"},
];
const ST={contacted:{label:"Contacté",color:"#2980B9",bg:"#EBF5FB"},quoted:{label:"Devis reçu",color:"#E67E22",bg:"#FEF5EC"},confirmed:{label:"Confirmé",color:"#27AE60",bg:"#F0FAF4"},paid:{label:"Payé",color:"#1E8449",bg:"#E0F2E9"},cancelled:{label:"Annulé",color:"#C0392B",bg:"#FDF2F0"}};
const X={bg:"#FBF8F3",bgA:"#F4EEE5",card:"#FFF",gold:"#C9A84C",wine:"#722F37",wineD:"#5C1F28",emerald:"#2D6A4F",txt:"#2C2420",txtM:"#8B7E74",txtL:"#B5A99A",brd:"#E8E0D4",brdL:"#F0EBE3",w:"#FFF",red:"#C0392B",grn:"#27AE60",org:"#E67E22",blue:"#2980B9"};

const DDAY_TEMPLATES={
  "5tenues":{name:"5 Tenues classique",items:[
    {time:"07:00",title:"Arrivée coordinatrice"},{time:"08:00",title:"Maquilleuse chez la mariée"},{time:"10:00",title:"Séance photo (1ère tenue)"},{time:"12:00",title:"Réception traiteur + mise en place"},{time:"15:00",title:"Sound check DJ"},{time:"16:00",title:"Neggafa prépare 1ère tenue"},{time:"17:00",title:"Accueil invités + thé"},{time:"17:30",title:"Entrée mariés - Tenue 1"},{time:"18:30",title:"Dîner servi"},{time:"20:00",title:"Tenue 2 + Amaria"},{time:"21:30",title:"Tenue 3 + ambiance"},{time:"22:30",title:"Tenue 4 + gâteau"},{time:"23:30",title:"Tenue 5 + lancer bouquet"},{time:"00:30",title:"Clôture + photos finales"}
  ]},
  "7tenues":{name:"7 Tenues grand mariage",items:[
    {time:"06:30",title:"Arrivée coordinatrice"},{time:"07:00",title:"Vérification décoration"},{time:"07:30",title:"Maquilleuse + coiffeuse"},{time:"10:00",title:"Photos mariée (tenue 1)"},{time:"12:00",title:"Traiteur + mise en place"},{time:"14:00",title:"Fleuriste + centres de table"},{time:"15:00",title:"Sound check"},{time:"16:00",title:"Neggafa - tenue 1"},{time:"17:00",title:"Accueil invités"},{time:"17:30",title:"Entrée - Tenue 1 (caftan)"},{time:"18:15",title:"Tenue 2 (takchita)"},{time:"19:00",title:"Dîner servi"},{time:"20:00",title:"Tenue 3 + Amaria"},{time:"21:00",title:"Tenue 4 (moderne)"},{time:"21:45",title:"Tenue 5 + ambiance"},{time:"22:30",title:"Tenue 6 + gâteau"},{time:"23:30",title:"Tenue 7 + lancer bouquet"},{time:"00:30",title:"Photos finales + départ"}
  ]},
  "outdoor":{name:"Réception en plein air",items:[
    {time:"08:00",title:"Arrivée coordinatrice"},{time:"09:00",title:"Montage tentes + décor"},{time:"10:00",title:"Maquilleuse"},{time:"13:00",title:"Traiteur installation"},{time:"15:00",title:"Sound check"},{time:"16:00",title:"Vérification éclairage"},{time:"17:00",title:"Accueil invités"},{time:"17:30",title:"Entrée mariés"},{time:"18:30",title:"Dîner"},{time:"20:00",title:"Changement tenue + Amaria"},{time:"21:30",title:"Soirée dansante"},{time:"23:00",title:"Gâteau + lancer bouquet"},{time:"00:00",title:"Clôture"}
  ]}
};

const fmt=n=>(n||0).toLocaleString("fr-MA")+" DH";
const fDate=d=>d?new Date(d+"T00:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"}):"";
const fShort=d=>d?new Date(d+"T00:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"}):"";
const typeOf=id=>TYPES.find(t=>t.id===id)||TYPES[11];
const daysTo=d=>d?Math.ceil((new Date(d)-new Date())/864e5):0;

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;font-family:'Outfit',system-ui,sans-serif;background:${X.bg};color:${X.txt}}
input,select,textarea,button{font-family:inherit}
.fi{animation:fadeUp .3s ease both}
.card-hover{transition:transform .1s}.card-hover:active{transform:scale(.98)}
`;

// ─── Components ─────────────────────────────────────────────
const Badge=({children,color,bg,style:s,onClick})=><span onClick={onClick} style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,color:color||X.txt,background:bg||X.bgA,letterSpacing:.3,whiteSpace:"nowrap",cursor:onClick?"pointer":"default",...s}}>{children}</span>;
const SBadge=({status})=>{const s=ST[status];return s?<Badge color={s.color} bg={s.bg}>{s.label}</Badge>:null;};
const Stars=({n,onSet})=><span style={{fontSize:16,letterSpacing:2,cursor:onSet?"pointer":"default"}}>{[1,2,3,4,5].map(i=><span key={i} onClick={()=>onSet?.(i)} style={{color:i<=n?X.gold:X.brd}}>{i<=n?"★":"☆"}</span>)}</span>;

function Btn({children,v="primary",sz="md",style:s,onClick,disabled:d}){
  const base={border:"none",cursor:d?"default":"pointer",fontWeight:600,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,borderRadius:10,fontFamily:"inherit",opacity:d?.5:1,transition:"all .15s"};
  const szs={sm:{padding:"7px 14px",fontSize:12},md:{padding:"10px 20px",fontSize:13},lg:{padding:"13px 26px",fontSize:14}};
  const vs={primary:{background:X.wine,color:X.w},gold:{background:X.gold,color:X.w},ghost:{background:"transparent",color:X.txtM,border:`1px solid ${X.brd}`},danger:{background:"#FDF2F0",color:X.red},success:{background:"#F0FAF4",color:X.grn}};
  return<button onClick={d?undefined:onClick} style={{...base,...szs[sz],...vs[v],...s}}>{children}</button>;
}
function Card({children,style:s,onClick}){return<div className="card-hover" onClick={onClick} style={{background:X.card,borderRadius:14,border:`1px solid ${X.brd}`,padding:20,boxShadow:"0 2px 8px rgba(44,36,32,.05)",cursor:onClick?"pointer":"default",...s}}>{children}</div>;}
function Inp({label:l,value:val,onChange:oc,type:t="text",placeholder:ph,textarea:ta,autoFocus:af,style:st}){
  const s={width:"100%",padding:"11px 14px",border:`1px solid ${X.brd}`,borderRadius:10,fontSize:14,background:X.bg,color:X.txt,outline:"none",boxSizing:"border-box",resize:ta?"vertical":undefined,minHeight:ta?80:undefined,...st};
  return<div style={{marginBottom:14}}>{l&&<label style={{display:"block",fontSize:12,fontWeight:600,color:X.txtM,marginBottom:5,letterSpacing:.3}}>{l}</label>}{ta?<textarea value={val} onChange={e=>oc(e.target.value)} placeholder={ph} style={s}/>:<input autoFocus={af} type={t} value={val} onChange={e=>oc(e.target.value)} placeholder={ph} style={s}/>}</div>;
}
function Sel({label:l,value:val,onChange:oc,options:opts}){
  return<div style={{marginBottom:14}}>{l&&<label style={{display:"block",fontSize:12,fontWeight:600,color:X.txtM,marginBottom:5,letterSpacing:.3}}>{l}</label>}<select value={val} onChange={e=>oc(e.target.value)} style={{width:"100%",padding:"11px 14px",border:`1px solid ${X.brd}`,borderRadius:10,fontSize:14,background:X.bg,color:X.txt,outline:"none"}}>{opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}
function Modal({open,onClose,title:t,children}){
  if(!open)return null;
  return<div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
    <div style={{position:"absolute",inset:0,background:"rgba(44,36,32,.45)",backdropFilter:"blur(4px)"}}/>
    <div onClick={e=>e.stopPropagation()} className="fi" style={{position:"relative",background:X.card,borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",width:"100%",maxWidth:500,maxHeight:"88vh",overflow:"auto"}}>
      <div style={{width:36,height:4,borderRadius:2,background:X.brd,margin:"0 auto 16px"}}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <h2 style={{margin:0,fontSize:17,fontWeight:700}}>{t}</h2>
        <button onClick={onClose} style={{background:X.bgA,border:"none",width:32,height:32,borderRadius:"50%",fontSize:16,cursor:"pointer",color:X.txtM,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}
function Progress({value:v,max:m,color:c}){const p=m>0?Math.min((v/m)*100,100):0;return<div style={{height:7,borderRadius:4,background:X.brdL,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,background:c||X.gold,borderRadius:4,transition:"width .5s ease"}}/></div>;}
function Empty({icon:i,text:t}){return<div style={{textAlign:"center",padding:"40px 20px",color:X.txtL}}><div style={{fontSize:40,marginBottom:8}}>{i}</div><div style={{fontSize:14}}>{t}</div></div>;}

function ConfirmDelete({show,onConfirm,onCancel,label}){
  if(!show)return null;
  return<div style={{padding:14,background:"#FDF2F0",borderRadius:10,marginTop:10}}>
    <div style={{fontSize:13,color:X.red,marginBottom:10}}>Supprimer {label||"cet élément"} ?</div>
    <div style={{display:"flex",gap:8}}><Btn v="ghost" sz="sm" style={{flex:1}} onClick={onCancel}>Annuler</Btn><Btn v="danger" sz="sm" style={{flex:1}} onClick={onConfirm}>Supprimer</Btn></div>
  </div>;
}

function PhotoPicker({onPhoto}){
  const ref=useRef(null);
  const handle=async(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>onPhoto(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value="";
  };
  return<><input ref={ref} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handle}/>
    <Btn v="ghost" sz="sm" onClick={()=>ref.current?.click()}>📸 Photo</Btn></>;
}

const TABS=[{id:"home",icon:"◈",label:"Accueil"},{id:"contacts",icon:"☎",label:"Contacts"},{id:"calls",icon:"📋",label:"Devis"},{id:"budget",icon:"💰",label:"Budget"},{id:"tasks",icon:"✓",label:"Tâches"},{id:"dday",icon:"⏱",label:"Jour J"},{id:"mood",icon:"🎨",label:"Plus"}];

// ═══════════════════════════════════════════════════════════════
export default function App(){
  const[loading,setLoading]=useState(true);
  const[tab,setTab]=useState("home");
  const[projects,setProjects]=useState([]);
  const[pid,setPid]=useState(null);
  const[prestateurs,setPrestateurs]=useState([]);
  const[calls,setCalls]=useState([]);
  const[tasks,setTasks]=useState([]);
  const[dday,setDday]=useState([]);
  const[mood,setMood]=useState([]);
  const[guests,setGuests]=useState([]);
  const[notes,setNotes]=useState([]);
  const[photos,setPhotos]=useState([]);
  const[modal,setModal]=useState(null);
  const[form,setForm]=useState({});
  const[timerOn,setTimerOn]=useState(false);
  const[timerS,setTimerS]=useState(0);
  const timerRef=useRef(null);
  const[cFilter,setCFilter]=useState("all");
  const[cSearch,setCSearch]=useState("");
  const[subTab,setSubTab]=useState("mood");
  const[confirmDel,setConfirmDel]=useState(null);

  useEffect(()=>{(async()=>{try{
    const p=await dbAll("projects");
    setPrestateurs(await dbAll("prestateurs"));setCalls(await dbAll("calls"));setTasks(await dbAll("tasks"));setDday(await dbAll("dday"));setMood(await dbAll("moodboard"));setGuests(await dbAll("guests"));setNotes(await dbAll("notes"));setPhotos(await dbAll("photos"));
    setProjects(p);setPid(p[0]?.id||null);
  }catch(e){console.error(e);}setLoading(false);})();},[]);

  useEffect(()=>{if(timerOn)timerRef.current=setInterval(()=>setTimerS(s=>s+1),1000);else clearInterval(timerRef.current);return()=>clearInterval(timerRef.current);},[timerOn]);
  const fTimer=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const proj=projects.find(p=>p.id===pid);
  const pC=calls.filter(c=>c.projectId===pid);
  const pT=tasks.filter(t=>t.projectId===pid);
  const pD=dday.filter(d=>d.projectId===pid).sort((a,b)=>(a.time||"").localeCompare(b.time||""));
  const pM=mood.filter(m=>m.projectId===pid);
  const pG=guests.filter(g=>g.projectId===pid);
  const pN=notes.filter(n=>n.projectId===pid).sort((a,b)=>b.date?.localeCompare(a.date));
  const pPh=photos.filter(p=>p.projectId===pid);
  const totQ=pC.reduce((s,c)=>s+(c.price||0),0);
  const totA=pC.reduce((s,c)=>s+(c.advance||0),0);
  const conf=pC.filter(c=>c.status==="confirmed"||c.status==="paid").length;
  const tDone=pT.filter(t=>t.done).length;

  const save=(store,item,setter)=>{dbPut(store,item);setter(prev=>{const i=prev.findIndex(x=>x.id===item.id);return i>=0?prev.map(x=>x.id===item.id?item:x):[...prev,item];});};
  const del=(store,id,setter)=>{dbDel(store,id);setter(prev=>prev.filter(x=>x.id!==id));};
  const closeModal=()=>{setModal(null);setForm({});setConfirmDel(null);};

  // WhatsApp share
  const shareWhatsApp=()=>{
    if(!proj)return;
    let msg=`💍 *${proj.name}*\n📅 ${fDate(proj.date)} | 👥 ${proj.guests} invités\n💰 Budget: ${fmt(proj.budget)}\n\n`;
    msg+=`✅ *Prestataires confirmés:*\n`;
    pC.filter(c=>c.status==="confirmed"||c.status==="paid").forEach(c=>{
      const pr=prestateurs.find(p=>p.id===c.prestateurId);
      if(pr)msg+=`  ${typeOf(pr.type).icon} ${pr.name} - ${fmt(c.price)}\n`;
    });
    const pending=pC.filter(c=>c.status==="contacted"||c.status==="quoted");
    if(pending.length){msg+=`\n⏳ *En attente (${pending.length}):*\n`;pending.forEach(c=>{const pr=prestateurs.find(p=>p.id===c.prestateurId);if(pr)msg+=`  ${typeOf(pr.type).icon} ${pr.name} - ${fmt(c.price)}\n`;});}
    msg+=`\n💰 Total devis: ${fmt(totQ)}\n💵 Avances payées: ${fmt(totA)}\n📊 Reste à payer: ${fmt(totQ-totA)}`;
    const pendingTasks=pT.filter(t=>!t.done);
    if(pendingTasks.length){msg+=`\n\n📝 *Tâches en cours (${pendingTasks.length}):*\n`;pendingTasks.slice(0,5).forEach(t=>{msg+=`  - ${t.title}${t.due?" ("+fShort(t.due)+")":""}\n`;});}
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  // Duplicate project
  const duplicateProject=()=>{
    if(!proj)return;
    const nid=uid();
    const np={...proj,id:nid,name:proj.name+" (copie)",date:"",bride:"",groom:""};
    save("projects",np,setProjects);
    pT.forEach(t=>save("tasks",{...t,id:uid(),projectId:nid,done:false},setTasks));
    pD.forEach(d=>save("dday",{...d,id:uid(),projectId:nid,done:false},setDday));
    setPid(nid);closeModal();
  };

  // ─── HOME ─────────────────────────────────────────────────
  const renderHome=()=>{
    if(!proj)return<div className="fi" style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:64,marginBottom:16}}>💍</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:X.wine,marginBottom:8}}>Bienvenue sur WeddingPlan</div>
      <div style={{fontSize:14,color:X.txtM,marginBottom:24,lineHeight:1.6}}>Votre outil de coordination de mariages.<br/>Commencez par créer votre premier projet.</div>
      <Btn sz="lg" v="gold" onClick={()=>{setForm({});setModal("newProj");}}>🎊 Créer mon premier mariage</Btn>
    </div>;
    const days=daysTo(proj.date);
    return<div className="fi">
      <div style={{background:`linear-gradient(135deg,${X.wine} 0%,${X.wineD} 100%)`,borderRadius:18,padding:"24px 20px",color:X.w,marginBottom:18,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-20,fontSize:120,opacity:.06}}>💍</div>
        <div style={{fontSize:11,fontWeight:600,opacity:.7,textTransform:"uppercase",letterSpacing:.5}}>Prochain événement</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,marginTop:4}}>{proj.name}</div>
        <div style={{fontSize:13,opacity:.8,marginTop:2}}>{fDate(proj.date)} · {proj.guests} invités</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginTop:14}}>
          <span style={{fontSize:42,fontWeight:800,lineHeight:1}}>{days}</span>
          <span style={{fontSize:14,opacity:.8}}>jours</span>
        </div>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <Btn sz="sm" style={{background:"rgba(255,255,255,.2)",color:X.w,border:"none"}} onClick={shareWhatsApp}>💬 Partager</Btn>
          <Btn sz="sm" style={{background:"rgba(255,255,255,.2)",color:X.w,border:"none"}} onClick={()=>{setForm(proj);setModal("editProj");}}>✏️ Modifier</Btn>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {[{l:"Budget",v:fmt(proj.budget),c:X.gold},{l:"Devis",v:fmt(totQ),c:totQ>proj.budget?X.red:X.emerald},{l:"Confirmés",v:`${conf}/${pC.length}`,c:X.wine}].map((s,i)=>
          <Card key={i} style={{padding:14,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:X.txtM,textTransform:"uppercase"}}>{s.l}</div><div style={{fontSize:18,fontWeight:800,color:s.c,marginTop:4}}>{s.v}</div></Card>
        )}
      </div>
      <Card style={{padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:X.txtM,marginBottom:6}}><span>{proj.budget>0?Math.round((totQ/proj.budget)*100):0}% du budget</span><span>{fmt(Math.max(0,proj.budget-totQ))} restant</span></div>
        <Progress value={totQ} max={proj.budget} color={totQ>proj.budget?X.red:X.gold}/>
      </Card>
      <Card style={{padding:16,marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:X.txtM,marginBottom:10,textTransform:"uppercase"}}>Prestations</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {TYPES.slice(0,10).map(pt=>{
            const has=pC.some(c=>{const pr=prestateurs.find(p=>p.id===c.prestateurId);return pr?.type===pt.id;});
            const ok=pC.some(c=>{const pr=prestateurs.find(p=>p.id===c.prestateurId);return pr?.type===pt.id&&(c.status==="confirmed"||c.status==="paid");});
            return<span key={pt.id} style={{padding:"4px 10px",borderRadius:16,fontSize:11,fontWeight:600,background:ok?"#F0FAF4":has?"#FEF5EC":X.bgA,color:ok?X.grn:has?X.org:X.txtL,border:`1px solid ${ok?"#B7E4C7":has?"#FDEBD0":X.brd}`}}>{pt.icon} {pt.label}{ok?" ✓":""}</span>;
          })}
        </div>
      </Card>
      {/* Payment timeline */}
      {pC.filter(c=>c.advance>0||c.status==="confirmed").length>0&&<Card style={{padding:16,marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:X.txtM,marginBottom:10,textTransform:"uppercase"}}>Paiements</div>
        {pC.filter(c=>c.price>0).map(c=>{const pr=prestateurs.find(p=>p.id===c.prestateurId);const pct=c.price>0?(c.advance/c.price)*100:0;return<div key={c.id} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{fontWeight:600}}>{pr?.name||"?"}</span><span style={{color:X.txtM}}>{fmt(c.advance)} / {fmt(c.price)}</span></div>
          <Progress value={c.advance} max={c.price} color={pct>=100?X.grn:X.org}/>
        </div>;})}
      </Card>}
      <Card style={{padding:16}} onClick={()=>setTab("tasks")}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,fontWeight:700,color:X.txtM}}>TÂCHES</span><Badge color={X.grn} bg="#F0FAF4">{tDone}/{pT.length}</Badge></div>
        <Progress value={tDone} max={pT.length} color={X.emerald}/>
        {pT.filter(t=>!t.done).slice(0,3).map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${X.brdL}`}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:t.priority==="high"?X.red:t.priority==="medium"?X.org:X.txtL,flexShrink:0}}/>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{t.title}</div><div style={{fontSize:11,color:X.txtL}}>{fShort(t.due)}</div></div>
        </div>)}
        <div style={{fontSize:12,color:X.wine,fontWeight:600,marginTop:10,textAlign:"center"}}>Voir tout →</div>
      </Card>
    </div>;
  };

  // ─── CONTACTS ─────────────────────────────────────────────
  const renderContacts=()=>{
    const fl=prestateurs.filter(p=>{if(cFilter!=="all"&&p.type!==cFilter)return false;if(cSearch&&!p.name.toLowerCase().includes(cSearch.toLowerCase())&&!(p.city||"").toLowerCase().includes(cSearch.toLowerCase()))return false;return true;});
    return<div className="fi">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700}}>☎ Répertoire</h3>
        <Btn sz="sm" onClick={()=>{setForm({name:"",type:"venue",phone:"",email:"",city:"",rating:5,notes:""});setModal("editPrest");}}>+ Ajouter</Btn>
      </div>
      <input value={cSearch} onChange={e=>setCSearch(e.target.value)} placeholder="🔍 Rechercher..." style={{width:"100%",padding:"10px 14px",border:`1px solid ${X.brd}`,borderRadius:12,fontSize:14,background:X.card,outline:"none",boxSizing:"border-box",marginBottom:10}}/>
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:6}}>
        <Badge onClick={()=>setCFilter("all")} style={{cursor:"pointer",border:cFilter==="all"?`2px solid ${X.wine}`:"2px solid transparent"}} color={cFilter==="all"?X.wine:X.txtM} bg={cFilter==="all"?"#F5E6E8":X.bgA}>Tous</Badge>
        {TYPES.map(t=><Badge key={t.id} onClick={()=>setCFilter(cFilter===t.id?"all":t.id)} style={{cursor:"pointer",border:cFilter===t.id?`2px solid ${t.color}`:"2px solid transparent",flexShrink:0}} color={cFilter===t.id?t.color:X.txtM} bg={cFilter===t.id?`${t.color}15`:X.bgA}>{t.icon}</Badge>)}
      </div>
      {fl.length===0?<Empty icon="📇" text="Aucun prestataire"/>:fl.map(pr=>{const pt=typeOf(pr.type);return<Card key={pr.id} style={{padding:16,marginBottom:10}} onClick={()=>{setForm({...pr});setModal("editPrest");}}>
        <div style={{display:"flex",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:`${pt.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{pt.icon}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:700}}>{pr.name}</div>
            <div style={{display:"flex",gap:6,marginTop:3,marginBottom:3}}><Badge color={pt.color} bg={`${pt.color}12`}>{pt.label}</Badge><Stars n={pr.rating}/></div>
            <div style={{fontSize:12,color:X.txtM}}>📍 {pr.city} · 📞 {pr.phone}</div>
            {pr.notes&&<div style={{fontSize:11,color:X.txtL,marginTop:4,fontStyle:"italic"}}>{pr.notes}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <Btn sz="sm" v="ghost" style={{flex:1}} onClick={e=>{e.stopPropagation();window.open(`tel:${pr.phone}`);}}>📞 Appeler</Btn>
          <Btn sz="sm" v="ghost" style={{flex:1}} onClick={e=>{e.stopPropagation();window.open(`https://wa.me/${pr.phone.replace(/\s/g,"")}`);}}>💬 WhatsApp</Btn>
        </div>
      </Card>;})}
    </div>;
  };

  // ─── CALLS / DEVIS ────────────────────────────────────────
  const[compareType,setCompareType]=useState(null);
  const renderCalls=()=>{
    const comparing=compareType?pC.filter(c=>{const pr=prestateurs.find(p=>p.id===c.prestateurId);return pr?.type===compareType;}):null;
    return<div className="fi">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700}}>📋 Devis</h3>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:10,background:timerOn?"#FDF2F0":X.bgA,border:`1px solid ${timerOn?X.red:X.brd}`}}>
            <span style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:timerOn?X.red:X.txtM,animation:timerOn?"pulse 1s infinite":"none"}}>{fTimer(timerS)}</span>
            <button onClick={()=>{if(!timerOn)setTimerS(0);setTimerOn(!timerOn);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:0}}>{timerOn?"⏸":"▶️"}</button>
          </div>
          <Btn sz="sm" onClick={()=>{setForm({prestateurId:"",price:"",notes:"",status:"contacted",advance:"",contractSigned:false,newPrestName:"",newPrestType:"venue"});setModal("editCall");}}>+</Btn>
        </div>
      </div>
      {/* Compare filter */}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:8}}>
        <Badge onClick={()=>setCompareType(null)} style={{cursor:"pointer"}} color={!compareType?X.wine:X.txtM} bg={!compareType?"#F5E6E8":X.bgA}>Tous</Badge>
        {TYPES.map(t=><Badge key={t.id} onClick={()=>setCompareType(compareType===t.id?null:t.id)} style={{cursor:"pointer",flexShrink:0}} color={compareType===t.id?t.color:X.txtM} bg={compareType===t.id?`${t.color}15`:X.bgA}>{t.icon}</Badge>)}
      </div>
      {compareType&&comparing&&comparing.length>1&&<Card style={{padding:16,marginBottom:14,background:"#FFFBF0",borderColor:X.gold}}>
        <div style={{fontSize:12,fontWeight:700,color:X.gold,marginBottom:10}}>⚖️ COMPARAISON: {typeOf(compareType).label}</div>
        {comparing.sort((a,b)=>a.price-b.price).map((c,i)=>{const pr=prestateurs.find(p=>p.id===c.prestateurId);return<div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<comparing.length-1?`1px solid ${X.brdL}`:"none"}}>
          <div><div style={{fontSize:13,fontWeight:600}}>{i===0?"🥇 ":"  "}{pr?.name}</div><div style={{fontSize:11,color:X.txtM}}><SBadge status={c.status}/></div></div>
          <div style={{fontSize:15,fontWeight:700,color:i===0?X.grn:X.txt}}>{fmt(c.price)}</div>
        </div>;})}
      </Card>}
      {(comparing||pC).length===0?<Empty icon="📞" text="Aucun devis"/>:(comparing||pC).sort((a,b)=>b.date?.localeCompare(a.date)).map(c=>{
        const pr=prestateurs.find(p=>p.id===c.prestateurId);const pt=pr?typeOf(pr.type):typeOf("other");
        return<Card key={c.id} style={{padding:16,marginBottom:10}} onClick={()=>{setForm({...c});setModal("editCall");}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><div style={{fontSize:15,fontWeight:700}}>{pr?.name||"?"}</div><div style={{display:"flex",gap:6,marginTop:4}}><Badge color={pt.color} bg={`${pt.color}12`}>{pt.icon} {pt.label}</Badge><SBadge status={c.status}/></div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:800,color:X.gold}}>{fmt(c.price)}</div><div style={{fontSize:11,color:X.txtL}}>{fDate(c.date)}</div></div>
          </div>
          <div style={{display:"flex",gap:10,fontSize:12,color:X.txtM,marginBottom:c.notes?6:0}}>
            {c.advance>0&&<span style={{color:X.grn}}>✓ Avance: {fmt(c.advance)}</span>}
            {c.contractSigned&&<span style={{color:X.grn}}>✓ Contrat</span>}
          </div>
          {c.notes&&<div style={{fontSize:12,color:X.txtM,padding:"8px 10px",background:X.bgA,borderRadius:8,lineHeight:1.5}}>{c.notes}</div>}
          {c.receiptPhoto&&<img src={c.receiptPhoto} style={{width:"100%",maxHeight:150,objectFit:"cover",borderRadius:8,marginTop:8}} alt="reçu"/>}
        </Card>;
      })}
    </div>;
  };

  // ─── BUDGET ───────────────────────────────────────────────
  const renderBudget=()=>{
    if(!proj)return null;
    const bt={};pC.forEach(c=>{const pr=prestateurs.find(p=>p.id===c.prestateurId);if(pr){if(!bt[pr.type])bt[pr.type]={q:0,p:0};bt[pr.type].q+=c.price||0;bt[pr.type].p+=c.advance||0;}});
    return<div className="fi">
      <h3 style={{margin:"0 0 14px",fontSize:16,fontWeight:700}}>💰 Budget</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Card style={{padding:16,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:X.txtM,textTransform:"uppercase"}}>Budget</div><div style={{fontSize:22,fontWeight:800,color:X.gold,fontFamily:"'Playfair Display',serif"}}>{fmt(proj.budget)}</div></Card>
        <Card style={{padding:16,textAlign:"center"}}><div style={{fontSize:10,fontWeight:700,color:X.txtM,textTransform:"uppercase"}}>Devis</div><div style={{fontSize:22,fontWeight:800,color:(proj.budget-totQ)<0?X.red:X.emerald,fontFamily:"'Playfair Display',serif"}}>{fmt(totQ)}</div></Card>
      </div>
      <Card style={{padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:X.txtM,marginBottom:6}}><span>Avances ({totQ>0?Math.round((totA/totQ)*100):0}%)</span><span>{fmt(totA)} / {fmt(totQ)}</span></div>
        <Progress value={totA} max={totQ} color={X.emerald}/>
      </Card>
      <Card style={{padding:16}}>
        <div style={{fontSize:11,fontWeight:700,color:X.txtM,marginBottom:12,textTransform:"uppercase"}}>Par prestation</div>
        {Object.entries(bt).sort((a,b)=>b[1].q-a[1].q).map(([type,d])=>{const pt=typeOf(type);return<div key={type} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,fontWeight:600}}>{pt.icon} {pt.label}</span><span style={{fontSize:13,fontWeight:700}}>{fmt(d.q)}</span></div>
          <Progress value={d.q} max={proj.budget} color={pt.color}/>
          {d.p>0&&<div style={{fontSize:11,color:X.grn,marginTop:3}}>Avance: {fmt(d.p)}</div>}
        </div>;})}
      </Card>
    </div>;
  };

  // ─── TASKS ────────────────────────────────────────────────
  const renderTasks=()=><div className="fi">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <h3 style={{margin:0,fontSize:16,fontWeight:700}}>✓ Tâches</h3>
      <Btn sz="sm" onClick={()=>{setForm({title:"",due:"",category:"venue",priority:"medium"});setModal("editTask");}}>+ Tâche</Btn>
    </div>
    <div style={{display:"flex",gap:6,marginBottom:8}}><Badge color={X.grn} bg="#F0FAF4">{tDone} fait</Badge><Badge color={X.org} bg="#FEF5EC">{pT.length-tDone} restant</Badge></div>
    <Progress value={tDone} max={pT.length} color={X.emerald}/>
    <div style={{marginTop:14}}>
    {["high","medium","low"].map(pri=>{const items=pT.filter(t=>t.priority===pri);if(!items.length)return null;const lbl={high:"🔴 Haute",medium:"🟡 Moyenne",low:"🔵 Basse"};
      return<div key={pri} style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:X.txtM,marginBottom:8,textTransform:"uppercase"}}>{lbl[pri]}</div>
        {items.map(t=>{const pt=typeOf(t.category);return<div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",marginBottom:6,background:X.card,borderRadius:12,border:`1px solid ${X.brd}`}}>
          <div onClick={()=>save("tasks",{...t,done:!t.done},setTasks)} style={{width:22,height:22,borderRadius:7,border:`2px solid ${t.done?X.grn:X.brd}`,background:t.done?X.grn:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:X.w,fontSize:12,flexShrink:0,cursor:"pointer"}}>{t.done&&"✓"}</div>
          <div style={{flex:1,cursor:"pointer"}} onClick={()=>{setForm({...t});setModal("editTask");}}>
            <div style={{fontSize:14,fontWeight:600,color:t.done?X.txtL:X.txt,textDecoration:t.done?"line-through":"none"}}>{t.title}</div>
            <div style={{fontSize:11,color:X.txtL,marginTop:2}}>{t.due&&<span>📅 {fShort(t.due)} </span>}{pt.icon} {pt.label}</div>
          </div>
        </div>;})}
      </div>;
    })}
    </div>
    {pT.length===0&&<Empty icon="✅" text="Aucune tâche"/>}
  </div>;

  // ─── JOUR J ───────────────────────────────────────────────
  const renderDDay=()=>{
    const dn=pD.filter(d=>d.done).length;
    return<div className="fi">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700}}>⏱ Jour J</h3>
        <div style={{display:"flex",gap:6}}>
          <Btn sz="sm" v="ghost" onClick={()=>setModal("ddayTemplate")}>📋 Modèle</Btn>
          <Btn sz="sm" onClick={()=>{setForm({time:"",title:""});setModal("editDDay");}}>+</Btn>
        </div>
      </div>
      {proj&&<div style={{background:`linear-gradient(135deg,${X.wine},${X.wineD})`,borderRadius:16,padding:"20px 18px",color:X.w,marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,fontWeight:600,opacity:.8}}>Le grand jour</div><div style={{fontSize:18,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>{fDate(proj.date)}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:30,fontWeight:800}}>{dn}/{pD.length}</div></div>
        </div>
        <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,.2)",overflow:"hidden",marginTop:12}}><div style={{height:"100%",width:pD.length?`${(dn/pD.length)*100}%`:"0%",background:X.gold,borderRadius:3}}/></div>
      </div>}
      <div style={{position:"relative",paddingLeft:30}}>
        <div style={{position:"absolute",left:13,top:10,bottom:10,width:2,background:X.brdL}}/>
        {pD.map(item=><div key={item.id} style={{position:"relative",marginBottom:6}}>
          <div style={{position:"absolute",left:-23,top:16,width:14,height:14,borderRadius:"50%",background:item.done?X.grn:X.card,border:`2px solid ${item.done?X.grn:X.brd}`,zIndex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:X.w}}>{item.done&&"✓"}</div>
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:X.card,borderRadius:12,border:`1px solid ${item.done?"#B7E4C7":X.brd}`,opacity:item.done?.6:1}}>
            <span onClick={()=>save("dday",{...item,done:!item.done},setDday)} style={{fontFamily:"monospace",fontSize:16,fontWeight:800,color:X.wine,minWidth:48,cursor:"pointer"}}>{item.time}</span>
            <span style={{flex:1,fontSize:14,fontWeight:600,textDecoration:item.done?"line-through":"none",color:item.done?X.txtL:X.txt,cursor:"pointer"}} onClick={()=>{setForm({...item});setModal("editDDay");}}>{item.title}</span>
          </div>
        </div>)}
      </div>
      {!pD.length&&<Empty icon="📋" text="Ajoutez les étapes ou choisissez un modèle"/>}
      <PhotoPicker onPhoto={(data)=>{save("photos",{id:uid(),projectId:pid,data,date:today(),label:"Jour J"},setPhotos);}}/>
    </div>;
  };

  // ─── MORE TAB (Mood + Guests + Notes + Photos) ────────────
  const renderMore=()=><div className="fi">
    <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto"}}>
      {[{id:"mood",label:"🎨 Mood"},{id:"guests",label:"👥 Invités"},{id:"notes",label:"📝 Notes"},{id:"photos",label:"📸 Photos"}].map(t=>
        <Badge key={t.id} onClick={()=>setSubTab(t.id)} style={{cursor:"pointer",padding:"8px 14px",fontSize:13}} color={subTab===t.id?X.wine:X.txtM} bg={subTab===t.id?"#F5E6E8":X.bgA}>{t.label}</Badge>
      )}
    </div>
    {subTab==="mood"&&<>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700}}>🎨 Moodboard</h3>
        <Btn sz="sm" onClick={()=>{setForm({label:"",color:"#C9A84C",emoji:"✨"});setModal("editMood");}}>+</Btn>
      </div>
      {proj&&<Card style={{padding:16,marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:X.txtM,marginBottom:8}}>PALETTE · {proj.theme}</div>
        <div style={{display:"flex",gap:10}}>{["#C9A84C","#722F37","#F5E6CC","#2C2420","#2D6A4F"].map((c,i)=><div key={i} style={{width:36,height:36,borderRadius:10,background:c,border:`2px solid ${X.brdL}`}}/>)}</div>
      </Card>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {pM.map(m=><div key={m.id} style={{position:"relative",borderRadius:14,overflow:"hidden",border:`1px solid ${X.brd}`,cursor:"pointer"}} onClick={()=>{setForm({...m});setModal("editMood");}}>
          <div style={{width:"100%",paddingTop:"110%",background:`linear-gradient(135deg,${m.color}30,${m.color}60)`,position:"relative"}}>{m.imageData?<img src={m.imageData} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>{m.emoji}</div>}</div>
          <div style={{padding:"8px 10px",background:X.card}}><div style={{fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.label}</div></div>
        </div>)}
      </div>
      <PhotoPicker onPhoto={(data)=>{save("moodboard",{id:uid(),projectId:pid,label:"Inspiration",color:"#C9A84C",emoji:"✨",imageData:data},setMood);}}/>
    </>}
    {subTab==="guests"&&<>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700}}>👥 Invités ({pG.length})</h3>
        <Btn sz="sm" onClick={()=>{setForm({name:"",side:"bride",table:"",dietary:"",confirmed:false});setModal("editGuest");}}>+</Btn>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        <Badge color={X.grn} bg="#F0FAF4">{pG.filter(g=>g.confirmed).length} confirmés</Badge>
        <Badge color={X.org} bg="#FEF5EC">{pG.filter(g=>!g.confirmed).length} en attente</Badge>
      </div>
      {pG.length===0?<Empty icon="👥" text="Ajoutez vos invités"/>:pG.map(g=><div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",marginBottom:6,background:X.card,borderRadius:12,border:`1px solid ${X.brd}`,cursor:"pointer"}} onClick={()=>{setForm({...g});setModal("editGuest");}}>
        <div style={{width:10,height:10,borderRadius:"50%",background:g.confirmed?X.grn:X.brd,flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600}}>{g.name}</div>
          <div style={{fontSize:11,color:X.txtL}}>{g.side==="bride"?"👰 Mariée":"🤵 Marié"}{g.table?` · Table ${g.table}`:""}{g.dietary?` · ${g.dietary}`:""}</div>
        </div>
      </div>)}
    </>}
    {subTab==="notes"&&<>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700}}>📝 Notes</h3>
        <Btn sz="sm" onClick={()=>{setForm({title:"",content:"",date:today()});setModal("editNote");}}>+</Btn>
      </div>
      {pN.length===0?<Empty icon="📝" text="Ajoutez des notes"/>:pN.map(n=><Card key={n.id} style={{padding:16,marginBottom:10,cursor:"pointer"}} onClick={()=>{setForm({...n});setModal("editNote");}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{n.title||"Sans titre"}</div>
        <div style={{fontSize:12,color:X.txtM,lineHeight:1.5}}>{(n.content||"").slice(0,120)}{(n.content||"").length>120?"...":""}</div>
        <div style={{fontSize:11,color:X.txtL,marginTop:6}}>{fDate(n.date)}</div>
      </Card>)}
    </>}
    {subTab==="photos"&&<>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700}}>📸 Photos & Reçus</h3>
        <PhotoPicker onPhoto={(data)=>{save("photos",{id:uid(),projectId:pid,data,date:today(),label:""},setPhotos);}}/>
      </div>
      {pPh.length===0?<Empty icon="📸" text="Aucune photo"/>:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {pPh.map(p=><div key={p.id} style={{position:"relative",borderRadius:10,overflow:"hidden",border:`1px solid ${X.brd}`}}>
          <img src={p.data} style={{width:"100%",aspectRatio:"1",objectFit:"cover"}} alt=""/>
          <button onClick={()=>del("photos",p.id,setPhotos)} style={{position:"absolute",top:4,right:4,width:22,height:22,borderRadius:"50%",background:"rgba(0,0,0,.5)",color:X.w,border:"none",cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          {p.label&&<div style={{position:"absolute",bottom:0,left:0,right:0,padding:"4px 6px",background:"rgba(0,0,0,.5)",color:X.w,fontSize:10}}>{p.label}</div>}
        </div>)}
      </div>}
    </>}
  </div>;

  // ─── MODALS ───────────────────────────────────────────────
  const modals=()=><>
    {/* Edit/New Prestateur */}
    <Modal open={modal==="editPrest"} onClose={closeModal} title={form.id?"✏️ Modifier prestataire":"📇 Nouveau prestataire"}>
      <Inp label="Nom" value={form.name||""} onChange={v=>setForm({...form,name:v})} placeholder="ex: Studio Lumière" autoFocus/>
      <Sel label="Type" value={form.type||"venue"} onChange={v=>setForm({...form,type:v})} options={TYPES.map(p=>({value:p.id,label:`${p.icon} ${p.label}`}))}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Téléphone" value={form.phone||""} onChange={v=>setForm({...form,phone:v})} type="tel" placeholder="+212 6..."/><Inp label="Ville" value={form.city||""} onChange={v=>setForm({...form,city:v})} placeholder="Casablanca"/></div>
      <Inp label="Email" value={form.email||""} onChange={v=>setForm({...form,email:v})} type="email"/>
      <div style={{marginBottom:14}}><label style={{display:"block",fontSize:12,fontWeight:600,color:X.txtM,marginBottom:5}}>Note</label><Stars n={form.rating||5} onSet={v=>setForm({...form,rating:v})}/></div>
      <Inp label="Notes" value={form.notes||""} onChange={v=>setForm({...form,notes:v})} textarea/>
      <Btn style={{width:"100%"}} disabled={!form.name} onClick={()=>{save("prestateurs",{id:form.id||uid(),name:form.name,type:form.type||"venue",phone:form.phone||"",email:form.email||"",city:form.city||"",rating:form.rating||5,notes:form.notes||""},setPrestateurs);closeModal();}}>Enregistrer</Btn>
      {form.id&&<ConfirmDelete show={confirmDel==="prest"} label="ce prestataire" onCancel={()=>setConfirmDel(null)} onConfirm={()=>{del("prestateurs",form.id,setPrestateurs);closeModal();}}/>}
      {form.id&&!confirmDel&&<Btn v="danger" sz="sm" style={{width:"100%",marginTop:10}} onClick={()=>setConfirmDel("prest")}>Supprimer</Btn>}
    </Modal>

    {/* Edit/New Call */}
    <Modal open={modal==="editCall"} onClose={closeModal} title={form.id?"✏️ Modifier devis":"📞 Nouveau devis"}>
      {!form.id&&<div style={{display:"flex",gap:8,marginBottom:14}}>
        <Badge onClick={()=>setForm({...form,quickAdd:false})} style={{cursor:"pointer",flex:1,textAlign:"center",padding:"8px"}} color={!form.quickAdd?X.wine:X.txtM} bg={!form.quickAdd?"#F5E6E8":X.bgA}>Existant</Badge>
        <Badge onClick={()=>setForm({...form,quickAdd:true,prestateurId:""})} style={{cursor:"pointer",flex:1,textAlign:"center",padding:"8px"}} color={form.quickAdd?X.wine:X.txtM} bg={form.quickAdd?"#F5E6E8":X.bgA}>+ Nouveau</Badge>
      </div>}
      {form.quickAdd&&!form.id?<>
        <Inp label="Nom du prestataire" value={form.newPrestName||""} onChange={v=>setForm({...form,newPrestName:v})} placeholder="ex: DJ Karim" autoFocus/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Sel label="Type" value={form.newPrestType||"venue"} onChange={v=>setForm({...form,newPrestType:v})} options={TYPES.map(p=>({value:p.id,label:`${p.icon} ${p.label}`}))}/>
          <Inp label="Téléphone" value={form.newPrestPhone||""} onChange={v=>setForm({...form,newPrestPhone:v})} type="tel" placeholder="+212 6..."/>
        </div>
      </>:<Sel label="Prestataire" value={form.prestateurId||""} onChange={v=>setForm({...form,prestateurId:v})} options={[{value:"",label:"Sélectionner..."},...prestateurs.map(p=>({value:p.id,label:`${typeOf(p.type).icon} ${p.name}`}))]}/>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Prix (DH)" value={form.price||""} onChange={v=>setForm({...form,price:v})} type="number" placeholder="15000"/><Sel label="Statut" value={form.status||"contacted"} onChange={v=>setForm({...form,status:v})} options={Object.entries(ST).map(([k,v])=>({value:k,label:v.label}))}/></div>
      <Inp label="Avance (DH)" value={form.advance||""} onChange={v=>setForm({...form,advance:v})} type="number" placeholder="0"/>
      <Inp label="Notes" value={form.notes||""} onChange={v=>setForm({...form,notes:v})} textarea placeholder="Détails, conditions..."/>
      <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:X.txtM,cursor:"pointer",marginBottom:16}}><input type="checkbox" checked={form.contractSigned||false} onChange={e=>setForm({...form,contractSigned:e.target.checked})} style={{accentColor:X.wine}}/> Contrat signé</label>
      {/* Receipt photo */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <PhotoPicker onPhoto={(data)=>setForm({...form,receiptPhoto:data})}/>
        {form.receiptPhoto&&<img src={form.receiptPhoto} style={{width:60,height:60,borderRadius:8,objectFit:"cover"}} alt="reçu"/>}
      </div>
      {timerS>0&&<div style={{padding:10,background:X.bgA,borderRadius:8,fontSize:12,color:X.txtM,marginBottom:12}}>⏱ Durée: {fTimer(timerS)}</div>}
      <Btn style={{width:"100%"}} disabled={!form.quickAdd&&!form.prestateurId&&!form.id||form.quickAdd&&!form.newPrestName} onClick={()=>{
        let prestId=form.prestateurId;
        if(form.quickAdd&&!form.id){
          const newP={id:uid(),name:form.newPrestName,type:form.newPrestType||"venue",phone:form.newPrestPhone||"",email:"",city:"",rating:3,notes:""};
          save("prestateurs",newP,setPrestateurs);
          prestId=newP.id;
        }
        save("calls",{id:form.id||uid(),projectId:pid,prestateurId:form.id?form.prestateurId:prestId,date:form.date||today(),price:Number(form.price)||0,advance:Number(form.advance)||0,status:form.status||"contacted",notes:form.notes||"",contractSigned:form.contractSigned||false,duration:timerS,receiptPhoto:form.receiptPhoto||""},setCalls);
        closeModal();setTimerOn(false);
      }}>Enregistrer</Btn>
      {form.id&&<ConfirmDelete show={confirmDel==="call"} label="ce devis" onCancel={()=>setConfirmDel(null)} onConfirm={()=>{del("calls",form.id,setCalls);closeModal();}}/>}
      {form.id&&!confirmDel&&<Btn v="danger" sz="sm" style={{width:"100%",marginTop:10}} onClick={()=>setConfirmDel("call")}>Supprimer</Btn>}
    </Modal>

    {/* Edit/New Task */}
    <Modal open={modal==="editTask"} onClose={closeModal} title={form.id?"✏️ Modifier tâche":"✓ Nouvelle tâche"}>
      <Inp label="Titre" value={form.title||""} onChange={v=>setForm({...form,title:v})} placeholder="ex: Confirmer traiteur" autoFocus/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Date" value={form.due||""} onChange={v=>setForm({...form,due:v})} type="date"/><Sel label="Catégorie" value={form.category||"venue"} onChange={v=>setForm({...form,category:v})} options={TYPES.map(p=>({value:p.id,label:`${p.icon} ${p.label}`}))}/></div>
      <Sel label="Priorité" value={form.priority||"medium"} onChange={v=>setForm({...form,priority:v})} options={[{value:"high",label:"🔴 Haute"},{value:"medium",label:"🟡 Moyenne"},{value:"low",label:"🔵 Basse"}]}/>
      <Btn style={{width:"100%"}} disabled={!form.title} onClick={()=>{save("tasks",{id:form.id||uid(),projectId:pid,title:form.title,due:form.due||"",done:form.done||false,category:form.category||"venue",priority:form.priority||"medium"},setTasks);closeModal();}}>Enregistrer</Btn>
      {form.id&&<ConfirmDelete show={confirmDel==="task"} label="cette tâche" onCancel={()=>setConfirmDel(null)} onConfirm={()=>{del("tasks",form.id,setTasks);closeModal();}}/>}
      {form.id&&!confirmDel&&<Btn v="danger" sz="sm" style={{width:"100%",marginTop:10}} onClick={()=>setConfirmDel("task")}>Supprimer</Btn>}
    </Modal>

    {/* Edit/New DDay */}
    <Modal open={modal==="editDDay"} onClose={closeModal} title={form.id?"✏️ Modifier étape":"⏱ Nouvelle étape"}>
      <Inp label="Heure" value={form.time||""} onChange={v=>setForm({...form,time:v})} type="time"/>
      <Inp label="Titre" value={form.title||""} onChange={v=>setForm({...form,title:v})} placeholder="ex: Arrivée DJ" autoFocus/>
      <Btn style={{width:"100%"}} disabled={!form.title||!form.time} onClick={()=>{save("dday",{id:form.id||uid(),projectId:pid,time:form.time,title:form.title,done:form.done||false},setDday);closeModal();}}>Enregistrer</Btn>
      {form.id&&<ConfirmDelete show={confirmDel==="dday"} label="cette étape" onCancel={()=>setConfirmDel(null)} onConfirm={()=>{del("dday",form.id,setDday);closeModal();}}/>}
      {form.id&&!confirmDel&&<Btn v="danger" sz="sm" style={{width:"100%",marginTop:10}} onClick={()=>setConfirmDel("dday")}>Supprimer</Btn>}
    </Modal>

    {/* DDay Templates */}
    <Modal open={modal==="ddayTemplate"} onClose={closeModal} title="📋 Modèles Jour J">
      <div style={{fontSize:13,color:X.txtM,marginBottom:16}}>Choisissez un modèle pour pré-remplir votre planning.</div>
      {Object.entries(DDAY_TEMPLATES).map(([k,t])=><Card key={k} style={{padding:16,marginBottom:10,cursor:"pointer"}} onClick={()=>{
        t.items.forEach((item,i)=>save("dday",{id:uid(),projectId:pid,time:item.time,title:item.title,done:false},setDday));
        closeModal();
      }}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{t.name}</div>
        <div style={{fontSize:12,color:X.txtM}}>{t.items.length} étapes · {t.items[0].time} - {t.items[t.items.length-1].time}</div>
      </Card>)}
    </Modal>

    {/* Edit/New Mood */}
    <Modal open={modal==="editMood"} onClose={closeModal} title={form.id?"✏️ Modifier":"🎨 Inspiration"}>
      <Inp label="Titre" value={form.label||""} onChange={v=>setForm({...form,label:v})} placeholder="ex: Amaria dorée" autoFocus/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Emoji" value={form.emoji||""} onChange={v=>setForm({...form,emoji:v})} placeholder="👑"/><Inp label="Couleur" value={form.color||"#C9A84C"} onChange={v=>setForm({...form,color:v})} type="color"/></div>
      <div style={{marginBottom:14}}><PhotoPicker onPhoto={(data)=>setForm({...form,imageData:data})}/>{form.imageData&&<img src={form.imageData} style={{width:"100%",maxHeight:150,objectFit:"cover",borderRadius:8,marginTop:8}} alt=""/>}</div>
      <Btn style={{width:"100%"}} disabled={!form.label} onClick={()=>{save("moodboard",{id:form.id||uid(),projectId:pid,label:form.label,color:form.color||"#C9A84C",emoji:form.emoji||"✨",imageData:form.imageData||""},setMood);closeModal();}}>Enregistrer</Btn>
      {form.id&&<ConfirmDelete show={confirmDel==="mood"} label="cette inspiration" onCancel={()=>setConfirmDel(null)} onConfirm={()=>{del("moodboard",form.id,setMood);closeModal();}}/>}
      {form.id&&!confirmDel&&<Btn v="danger" sz="sm" style={{width:"100%",marginTop:10}} onClick={()=>setConfirmDel("mood")}>Supprimer</Btn>}
    </Modal>

    {/* Edit/New Guest */}
    <Modal open={modal==="editGuest"} onClose={closeModal} title={form.id?"✏️ Modifier invité":"👥 Nouvel invité"}>
      <Inp label="Nom" value={form.name||""} onChange={v=>setForm({...form,name:v})} placeholder="Nom complet" autoFocus/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Sel label="Côté" value={form.side||"bride"} onChange={v=>setForm({...form,side:v})} options={[{value:"bride",label:"👰 Mariée"},{value:"groom",label:"🤵 Marié"}]}/>
        <Inp label="Table" value={form.table||""} onChange={v=>setForm({...form,table:v})} placeholder="ex: 5"/>
      </div>
      <Inp label="Régime / Notes" value={form.dietary||""} onChange={v=>setForm({...form,dietary:v})} placeholder="Végétarien, allergies..."/>
      <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:X.txtM,cursor:"pointer",marginBottom:16}}><input type="checkbox" checked={form.confirmed||false} onChange={e=>setForm({...form,confirmed:e.target.checked})} style={{accentColor:X.grn}}/> Présence confirmée</label>
      <Btn style={{width:"100%"}} disabled={!form.name} onClick={()=>{save("guests",{id:form.id||uid(),projectId:pid,name:form.name,side:form.side||"bride",table:form.table||"",dietary:form.dietary||"",confirmed:form.confirmed||false},setGuests);closeModal();}}>Enregistrer</Btn>
      {form.id&&<ConfirmDelete show={confirmDel==="guest"} label="cet invité" onCancel={()=>setConfirmDel(null)} onConfirm={()=>{del("guests",form.id,setGuests);closeModal();}}/>}
      {form.id&&!confirmDel&&<Btn v="danger" sz="sm" style={{width:"100%",marginTop:10}} onClick={()=>setConfirmDel("guest")}>Supprimer</Btn>}
    </Modal>

    {/* Edit/New Note */}
    <Modal open={modal==="editNote"} onClose={closeModal} title={form.id?"✏️ Modifier note":"📝 Nouvelle note"}>
      <Inp label="Titre" value={form.title||""} onChange={v=>setForm({...form,title:v})} placeholder="ex: Préférences de la mariée" autoFocus/>
      <Inp label="Contenu" value={form.content||""} onChange={v=>setForm({...form,content:v})} textarea placeholder="Notes libres..."/>
      <Btn style={{width:"100%"}} disabled={!form.title} onClick={()=>{save("notes",{id:form.id||uid(),projectId:pid,title:form.title,content:form.content||"",date:form.date||today()},setNotes);closeModal();}}>Enregistrer</Btn>
      {form.id&&<ConfirmDelete show={confirmDel==="note"} label="cette note" onCancel={()=>setConfirmDel(null)} onConfirm={()=>{del("notes",form.id,setNotes);closeModal();}}/>}
      {form.id&&!confirmDel&&<Btn v="danger" sz="sm" style={{width:"100%",marginTop:10}} onClick={()=>setConfirmDel("note")}>Supprimer</Btn>}
    </Modal>

    {/* Edit Project */}
    <Modal open={modal==="editProj"} onClose={closeModal} title="✏️ Modifier le projet">
      <Inp label="Nom" value={form.name||""} onChange={v=>setForm({...form,name:v})}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Mariée" value={form.bride||""} onChange={v=>setForm({...form,bride:v})}/><Inp label="Marié" value={form.groom||""} onChange={v=>setForm({...form,groom:v})}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Date" value={form.date||""} onChange={v=>setForm({...form,date:v})} type="date"/><Inp label="Invités" value={form.guests||""} onChange={v=>setForm({...form,guests:v})} type="number"/></div>
      <Inp label="Budget (DH)" value={form.budget||""} onChange={v=>setForm({...form,budget:v})} type="number"/>
      <Inp label="Thème" value={form.theme||""} onChange={v=>setForm({...form,theme:v})}/>
      <Btn style={{width:"100%"}} onClick={()=>{save("projects",{...form,budget:Number(form.budget)||0,guests:Number(form.guests)||0},setProjects);closeModal();}}>Enregistrer</Btn>
      <Btn v="ghost" sz="sm" style={{width:"100%",marginTop:10}} onClick={duplicateProject}>📋 Dupliquer ce projet</Btn>
      {form.id&&<ConfirmDelete show={confirmDel==="proj"} label="ce projet et toutes ses données" onCancel={()=>setConfirmDel(null)} onConfirm={()=>{
        del("projects",form.id,setProjects);
        pC.forEach(c=>del("calls",c.id,setCalls));pT.forEach(t=>del("tasks",t.id,setTasks));pD.forEach(d=>del("dday",d.id,setDday));pM.forEach(m=>del("moodboard",m.id,setMood));pG.forEach(g=>del("guests",g.id,setGuests));pN.forEach(n=>del("notes",n.id,setNotes));
        setPid(projects.filter(p=>p.id!==form.id)[0]?.id||null);closeModal();
      }}/>}
      {form.id&&!confirmDel&&<Btn v="danger" sz="sm" style={{width:"100%",marginTop:10}} onClick={()=>setConfirmDel("proj")}>Supprimer le projet</Btn>}
    </Modal>

    {/* New Project */}
    <Modal open={modal==="newProj"} onClose={closeModal} title="🎊 Nouveau projet">
      <Inp label="Nom du mariage" value={form.name||""} onChange={v=>setForm({...form,name:v})} placeholder="Mariage Sara & Omar" autoFocus/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Mariée" value={form.bride||""} onChange={v=>setForm({...form,bride:v})}/><Inp label="Marié" value={form.groom||""} onChange={v=>setForm({...form,groom:v})}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><Inp label="Date" value={form.date||""} onChange={v=>setForm({...form,date:v})} type="date"/><Inp label="Invités" value={form.guests||""} onChange={v=>setForm({...form,guests:v})} type="number" placeholder="350"/></div>
      <Inp label="Budget (DH)" value={form.budget||""} onChange={v=>setForm({...form,budget:v})} type="number" placeholder="85000"/>
      <Inp label="Thème" value={form.theme||""} onChange={v=>setForm({...form,theme:v})} placeholder="Royal Gold & Burgundy"/>
      <Btn style={{width:"100%"}} disabled={!form.name} onClick={()=>{const p={id:uid(),name:form.name,date:form.date||"",bride:form.bride||"",groom:form.groom||"",budget:Number(form.budget)||0,theme:form.theme||"",guests:Number(form.guests)||0};save("projects",p,setProjects);setPid(p.id);closeModal();}}>Créer</Btn>
    </Modal>

    {/* Project Picker */}
    <Modal open={modal==="projects"} onClose={closeModal} title="🎊 Mes projets">
      {projects.map(p=><div key={p.id} onClick={()=>{setPid(p.id);closeModal();}} style={{padding:"14px 16px",borderRadius:12,marginBottom:8,cursor:"pointer",background:p.id===pid?`${X.wine}10`:X.bgA,border:`1px solid ${p.id===pid?X.wine:X.brd}`}}>
        <div style={{fontSize:15,fontWeight:700,color:p.id===pid?X.wine:X.txt}}>{p.name}</div>
        <div style={{fontSize:12,color:X.txtM,marginTop:2}}>{fDate(p.date)} · {p.guests} invités · {fmt(p.budget)}</div>
      </div>)}
      <Btn style={{width:"100%",marginTop:8}} v="gold" onClick={()=>{setForm({});setModal("newProj");}}>+ Nouveau projet</Btn>
    </Modal>
  </>;

  // ─── LAYOUT ───────────────────────────────────────────────
  if(loading)return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:X.bg,flexDirection:"column",gap:12}}><style>{CSS}</style><div style={{fontSize:48}}>💍</div><div style={{fontSize:22,fontWeight:700,fontFamily:"'Playfair Display',serif",color:X.wine}}>WeddingPlan</div></div>;

  const views={home:renderHome,contacts:renderContacts,calls:renderCalls,budget:renderBudget,tasks:renderTasks,dday:renderDDay,mood:renderMore};

  return<div style={{minHeight:"100vh",background:X.bg,paddingBottom:80}}>
    <style>{CSS}</style>
    <header style={{background:`linear-gradient(135deg,${X.wine} 0%,${X.wineD} 100%)`,color:X.w,paddingTop:"env(safe-area-inset-top, 14px)",position:"sticky",top:0,zIndex:100}}>
      <div style={{padding:"12px 18px 10px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>💍</span><span style={{fontSize:17,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>WeddingPlan</span></div>
        </div>
        <div onClick={()=>setModal("projects")} style={{cursor:"pointer",padding:"9px 14px",borderRadius:10,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",gap:8,fontSize:13,fontWeight:600,border:"1px solid rgba(255,255,255,.15)"}}>
          <span>🎊</span><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{proj?.name||"Choisir un projet"}</span><span style={{fontSize:10,opacity:.5}}>▼</span>
        </div>
      </div>
    </header>
    <main style={{padding:"18px 16px",maxWidth:600,margin:"0 auto"}}>{views[tab]?.()}</main>
    <nav style={{position:"fixed",bottom:0,left:0,right:0,background:X.card,borderTop:`1px solid ${X.brd}`,display:"flex",justifyContent:"space-around",padding:"6px 0 env(safe-area-inset-bottom, 8px)",zIndex:100}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 4px",flex:1,color:tab===t.id?X.wine:X.txtL,transition:"color .15s"}}>
        <span style={{fontSize:18,lineHeight:1}}>{t.icon}</span><span style={{fontSize:9,fontWeight:600}}>{t.label}</span>{tab===t.id&&<div style={{width:16,height:2,borderRadius:1,background:X.wine,marginTop:1}}/>}
      </button>)}
    </nav>
    {modals()}
  </div>;
}
