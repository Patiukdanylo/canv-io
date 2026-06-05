/* ===================== AI Mock Exams — Canvas-style SPA ===================== */

/* ---------- small helpers ---------- */
const $ = s => document.querySelector(s);
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const esc = s => (s==null?"":String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function norm(s){ return (s||"").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"")
  .replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim(); }
const initials = n => (n||"?").trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();

/* ---------- the Canv.io mark (logo) ---------- */
const MARK_SVG = `<svg viewBox="0 0 96 96" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><rect width="96" height="96" rx="22" fill="#ee5a2c"/><path d="M24 55 A24 24 0 1 1 72 55" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M21 64 C40 56 64 56 81 60 C64 68 39 72 21 64 Z" fill="#fff"/></svg>`;

/* ===================== AUTH (client-side; prototype only — not secure) ===================== */
const USERS_LS="canvio_users", SESS_LS="canvio_session";
const loadUsers = ()=> JSON.parse(localStorage.getItem(USERS_LS)||"null");
const saveUsers = u => localStorage.setItem(USERS_LS, JSON.stringify(u));
function seedUsers(){
  if(loadUsers()) return;
  saveUsers([
    { name:"Admin",   email:"admin@canv.io",   pass:"admin123",   role:"admin"   },
    { name:"Student", email:"student@canv.io", pass:"student123", role:"student" },
  ]);
}
const currentUser = ()=>{ const e=localStorage.getItem(SESS_LS); return e ? (loadUsers()||[]).find(u=>u.email===e)||null : null; };
function login(email,pass){
  const u=(loadUsers()||[]).find(x=>x.email===(email||"").toLowerCase().trim());
  if(!u || u.pass!==pass) return "Invalid email or password.";
  localStorage.setItem(SESS_LS,u.email); return null;
}
function register(name,email,pass){
  email=(email||"").toLowerCase().trim(); name=(name||"").trim();
  if(!name||!email||!pass) return "Please fill in every field.";
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Enter a valid email address.";
  if(pass.length<6) return "Password must be at least 6 characters.";
  const us=loadUsers()||[];
  if(us.some(u=>u.email===email)) return "That email is already registered.";
  us.push({name,email,pass,role:"student"}); saveUsers(us);
  localStorage.setItem(SESS_LS,email); return null;
}
function logout(){ localStorage.removeItem(SESS_LS); state.view="auth"; renderAuth(); }

/* ---------- per-user attempt storage ---------- */
const attKey = ()=>{ const u=currentUser(); return "canvio_att_"+(u?u.email:"anon"); };
const loadAtt = ()=> JSON.parse(localStorage.getItem(attKey())||"{}");
const saveAtt = o => localStorage.setItem(attKey(), JSON.stringify(o));

/* ---------- app state ---------- */
const state = { view:"quizzes", quizId:null, exam:null, cur:0, started:null, timer:null, review:null, flash:"" };

/* ---------- rail icons (inline svg) ---------- */
function ic(p,extra=""){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`; }
const ICONS = {
  portal: ic('<path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M7 10v5c0 1 2 2 5 2s5-1 5-2v-5"/>'),
  dash:   ic('<path d="M3 13a9 9 0 0 1 18 0"/><path d="M12 13l4-3"/>'),
  course: ic('<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M6 17h12"/>'),
  groups: ic('<circle cx="9" cy="9" r="3"/><path d="M3 19c0-3 3-4 6-4s6 1 6 4"/><circle cx="17" cy="8" r="2.2"/><path d="M15.5 14c3 0 4.5 1.5 4.5 4"/>'),
  cal:    ic('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 3v3M16 3v3"/>'),
  inbox:  ic('<path d="M3 5h18v14H3z"/><path d="M3 7l9 6 9-6"/>'),
  port:   ic('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  hist:   ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  help:   ic('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1 .9-1 1.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>'),
  news:   ic('<rect x="3" y="5" width="14" height="14" rx="1.5"/><path d="M17 9h3v8a2 2 0 0 1-2 2H7M6 9h6M6 12h6M6 15h4"/>')
};
function railHTML(active){
  const u = currentUser();
  const item=(label,svg,click,on)=>`<button class="item ${on?'act':''}" onclick="${click}">${svg}<span>${label}</span></button>`;
  const adminItem = u && u.role==="admin"
    ? item('Admin', ic('<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/>'), 'renderAdmin()', active==='Admin')
    : "";
  return `<div class="rail">
    <button class="item ${active==='Account'?'act':''}" onclick="renderProfile()"><span class="avatar">${u?initials(u.name):''}</span><span>Account</span></button>
    ${item('Courses',ICONS.course,'renderCourses()',active==='Courses')}
    ${item('Settings', ic('<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 2h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4L4.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z"/>'),'renderSettings()',active==='Settings')}
    ${adminItem}
  </div>`;
}

/* ---------- course nav column ---------- */
function navHTML(active){
  const links=[["Home","renderCourses()"],["Quizzes","goQuizzes()"]];
  return `<div class="coursenav"><div class="term">AJ 2025 Semester 2</div>${
    links.map(([l,click,pill])=>`<a class="${active===l?'act':''}" onclick="${click||''}">${l}${pill?`<span class="pill">${pill}</span>`:''}</a>`).join("")
  }</div>`;
}

/* ---------- top bar + breadcrumb ---------- */
function topHTML(crumbTail){
  const tail = crumbTail||"";
  const u = currentUser();
  const acct = u ? `<div class="acctbox">
      <button class="acct" onclick="renderProfile()"><span class="ava">${initials(u.name)}</span><span class="an">${esc(u.name)}</span></button>
      <button class="signout" onclick="logout()">Sign out</button>
    </div>` : "";
  return `<div class="topbar">
    <button class="brand" onclick="renderCourses()"><span class="bmark">${MARK_SVG}</span><span class="bword">Canv<span class="io">.io</span></span></button>
    <div class="crumbs"><a onclick="renderCourses()">Courses</a>
      <span class="sep">&#9656;</span><a onclick="goQuizzes()">Artificial Intelligence</a>${tail}</div>
    ${acct}
  </div>`;
}

/* ---------- master render ---------- */
function paint(mainHTML, opts={}){
  const tail = opts.crumb? `<span class="sep">&#9656;</span><span class="cur">${esc(opts.crumb)}</span>`:"";
  const right = opts.right? `<div class="qpanel">${opts.right}</div>`:"";
  const inner = opts.right? `<div class="withside"><div>${mainHTML}</div>${right}</div>` : mainHTML;
  const nav = opts.bareNav ? "" : navHTML(opts.nav||"");
  $("#root").innerHTML = topHTML(tail) + `<div class="shell">${railHTML(opts.rail||"")}${nav}<div class="main">${inner}</div></div>`;
  if(opts.after) opts.after();
}

/* =========================================================== QUIZZES INDEX */
function goQuizzes(){ stopTimer(); state.view="quizzes"; state.exam=null; state.review=null;
  const rocket=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8.5l-9.19 9.19a4 4 0 0 1-5.66-5.66l9-9a2.5 2.5 0 0 1 3.54 3.54l-9.02 9.02a1 1 0 0 1-1.42-1.42l8.31-8.31"/></svg>`;
  const rows = QUIZZES.map(qz=>{
    const {total} = composeInfo(qz);
    const att = (loadAtt()[qz.id]||[]);
    const best = att.length? Math.max(...att.map(a=>a.score)) : null;
    return `<div class="qzrow"><span class="ic">${rocket}</span><div style="flex:1">
        <div class="ttl"><a onclick="openCover('${qz.id}')">${esc(qz.title)}</a></div>
        <div class="meta">${total} pts &middot; ${count(qz)} questions &middot; Target ${Math.round(total*0.8)} (80%)${att.length?` &middot; ${att.length} attempt${att.length>1?'s':''}, best ${best}/${total}`:''}</div>
        <div class="meta">${esc(qz.blurb)}</div>
      </div></div>`;
  }).join("");
  paint(`<h1>Quizzes</h1>
    <p class="muted small">AI mock exams — pick one. Every attempt draws fresh questions from the bank, so you can take the same exam again and again with different questions. Multiple-choice, fill-in-the-blank and matching are graded automatically; essays get a model answer for self-grading.</p>
    <div class="qzlist">${rows}</div>`, {nav:"Quizzes", rail:"Courses"});
}
function composeInfo(qz){
  const pools = poolsFor(qz);
  const c = qz.compose;
  const nS=Math.min(c.standard||0,pools.standard.length), nC=Math.min(c.challenging||0,pools.challenging.length), nE=Math.min(c.essay||0,pools.essay.length);
  return { total:nS*1+nC*2+nE*5, nS,nC,nE };
}
const count = qz => { const i=composeInfo(qz); return i.nS+i.nC+i.nE; };
function poolsFor(qz){
  const f = arr => qz.topics? arr.filter(q=>qz.topics.includes(q.topic)) : arr;
  return { standard:f(BANK.standard), challenging:f(BANK.challenging), essay:f(BANK.essay) };
}

/* =========================================================== BUILD ATTEMPT */
function buildExam(qz){
  const pools = poolsFor(qz); const {nS,nC,nE}=composeInfo(qz);
  let chosen = [
    ...shuffle(pools.standard).slice(0,nS).map(q=>({...q,pts:1,diff:"standard"})),
    ...shuffle(pools.challenging).slice(0,nC).map(q=>({...q,pts:2,diff:"challenging"})),
    ...shuffle(pools.essay).slice(0,nE).map(q=>({...q,pts:5,diff:"essay",t:"essay"})),
  ];
  chosen = shuffle(chosen);
  chosen.forEach((q,i)=>{ q.uid=i; q.resp=undefined; q.matchResp={}; q.selfScore=null;
    if(q.t==="mc") q._opts=shuffle(q.o);
    if(q.t==="match") q._right=shuffle(q.right); });
  return chosen;
}

/* =========================================================== COVER */
function openCover(id){ stopTimer(); state.view="cover"; state.quizId=id; state.review=null;
  const qz = QUIZZES.find(q=>q.id===id); const {total}=composeInfo(qz);
  const flash = state.flash; state.flash="";
  const att = (loadAtt()[id]||[]);
  let histHTML="";
  if(att.length){
    const bestIdx = att.reduce((b,a,i)=> a.score>att[b].score? i:b, 0);
    const rows = att.map((a,i)=>{
      const lbl = i===att.length-1 ? "LATEST" : (i===bestIdx? "KEPT":"");
      return `<tr><td class="lbl">${lbl}</td><td><a onclick="reviewAttempt('${id}',${i})">Attempt ${i+1}</a></td>
        <td>${a.minutes} minute${a.minutes===1?'':'s'}</td><td>${a.score} out of ${total}</td>
        <td><a onclick="reviewAttempt('${id}',${i})">Review</a></td></tr>`;
    }).reverse().join("");
    histHTML = `<h2>Attempt history</h2><table class="hist">
      <tr><th></th><th>Attempt</th><th>Time</th><th>Score</th><th></th></tr>${rows}</table>`;
  }
  const inProg = state.exam && state.quizId===id;
  paint(`${flash?`<div class="flash">${esc(flash)}</div>`:''}
    <h1>${esc(qz.title)}</h1>
    <div class="metarow">
      <span><b>Due</b> No due date</span><span><b>Points</b> ${total}</span>
      <span><b>Questions</b> ${count(qz)}</span><span><b>Time limit</b> None</span>
      <span><b>Allowed attempts</b> Unlimited</span>
    </div>
    <h2>Instructions</h2>
    <p>Target is ${Math.round(total*0.8)} out of ${total}! &nbsp;<span class="muted small">(80% — your pass mark)</span></p>
    <p class="muted small">${esc(qz.blurb)} Fresh questions each attempt. No negative marking — always answer.</p>
    <div class="center"><button class="btn" onclick="${inProg?'resumeAttempt()':`startAttempt('${id}')`}">${inProg?'Resume quiz':(att.length?'Take the quiz again':'Take the quiz')}</button></div>
    ${histHTML}`, {nav:"", crumb:qz.title});
}

/* =========================================================== TAKE */
function startAttempt(id){ const qz=QUIZZES.find(q=>q.id===id);
  state.quizId=id; state.exam=buildExam(qz); state.cur=0; state.started=new Date();
  state.view="take"; startTimer(); renderTake(); }
function resumeAttempt(){ state.view="take"; startTimer(); renderTake(); }

function answered(q){
  if(q.t==="mc"||q.t==="fill") return q.resp!==undefined && q.resp!=="";
  if(q.t==="essay") return q.resp && q.resp.trim().length>0;
  if(q.t==="match") return q.left.every(l=>q.matchResp[l]);
  return false;
}
function go(i){ state.cur=Math.max(0,Math.min(state.exam.length-1,i)); renderTake(); }

function renderTake(){
  const exam=state.exam, q=exam[state.cur], qz=QUIZZES.find(x=>x.id===state.quizId);
  const {total}=composeInfo(qz);
  let body="";
  if(q.t==="mc"){
    body = q._opts.map(o=>`<label class="opt"><input type="radio" name="opt" value="${esc(o)}" ${q.resp===o?'checked':''}><span>${esc(o)}</span></label>`).join("");
  } else if(q.t==="fill"){
    body = `<div class="fill"><input id="fillin" type="text" autocomplete="off" placeholder="Type your answer…" value="${esc(q.resp||'')}"></div>`;
  } else if(q.t==="essay"){
    body = `<textarea id="essaybox" placeholder="Write your detailed answer (English preferred)…">${esc(q.resp||'')}</textarea>`;
  } else if(q.t==="match"){
    body = q.left.map(l=>{ const opts=['<option value="">[ Choose ]</option>'].concat(q._right.map(r=>`<option ${q.matchResp[l]===r?'selected':''} value="${esc(r)}">${esc(r)}</option>`)).join("");
      return `<div class="match-row"><span class="ml">${esc(l)}</span><select data-left="${esc(l)}">${opts}</select></div>`; }).join("");
  }
  const code = q.code?`<div class="code">${esc(q.code)}</div>`:"";
  const main = `<h1>${esc(qz.title)}</h1>
    <p class="muted small">Started: ${state.started.toLocaleString('en-GB',{day:'numeric',month:'short'})} at ${hm(state.started)}</p>
    <h2>Quiz instructions</h2><p>Target is ${Math.round(total*0.8)} out of ${total}!</p><hr>
    <div class="qwrap"><span class="flag">&#9873;</span>
      <div class="qcard"><div class="qhead"><span class="qn">Question ${state.cur+1}</span><span class="pts">${q.pts} pts</span></div>
        <div class="qbody"><p class="qtext">${esc(q.q)}</p>${code}${body}</div></div></div>
    <div class="navbar">
      <button class="btn g" onclick="go(${state.cur-1})" ${state.cur===0?'disabled':''}>&#9666; Previous</button>
      ${state.cur<exam.length-1?`<button class="btn g" onclick="go(${state.cur+1})">Next &#9656;</button>`:'<span></span>'}
    </div>
    <div class="savebar"><span id="savelbl">Saved at ${hm(new Date())}</span><button class="btn g" onclick="submitQuiz()">Submit quiz</button></div>`;
  const right = `<h3>Questions</h3><ul>${exam.map((qq,i)=>`<li class="${i===state.cur?'cur':''} ${answered(qq)?'done':''}" onclick="go(${i})"><span class="dot">${answered(qq)?'✓':'?'}</span>Question ${i+1}</li>`).join("")}</ul>
    <div class="qtimer">Time elapsed: <button class="hide" onclick="toggleTime()">Hide Time</button><span class="t" id="elapsed">0 minutes, 00 Seconds</span></div>`;
  paint(main, {nav:"", crumb:qz.title, right, after:bindInputs});
  startTimer();
}
function bindInputs(){
  const q=state.exam[state.cur];
  if(q.t==="mc") document.querySelectorAll('input[name=opt]').forEach(r=>r.addEventListener("change",()=>{q.resp=r.value;mark();}));
  if(q.t==="fill"){ const i=$("#fillin"); i.addEventListener("input",()=>{q.resp=i.value;mark();}); i.focus(); }
  if(q.t==="essay"){ const t=$("#essaybox"); t.addEventListener("input",()=>{q.resp=t.value;mark();}); }
  if(q.t==="match") document.querySelectorAll('select[data-left]').forEach(s=>s.addEventListener("change",()=>{q.matchResp[s.dataset.left]=s.value;mark();}));
}
function mark(){ const lbl=$("#savelbl"); if(lbl) lbl.textContent="Saving…";
  setTimeout(()=>{ const l=$("#savelbl"); if(l) l.textContent="Saved at "+hm(new Date()); },350);
  document.querySelectorAll('.qpanel li').forEach((li,i)=>{ const a=answered(state.exam[i]); li.classList.toggle('done',a); const d=li.querySelector('.dot'); if(d)d.textContent=a?'✓':'?'; });
}

/* ---------- timer ---------- */
let timeHidden=false;
function fmt(sec){ const m=Math.floor(sec/60),s=sec%60; return `${m} minute${m===1?'':'s'}, ${String(s).padStart(2,'0')} Seconds`; }
function startTimer(){ stopTimer(); state.timer=setInterval(()=>{ const el=$("#elapsed"); if(el&&!timeHidden){ el.textContent=fmt(Math.floor((Date.now()-state.started)/1000)); } },1000); }
function stopTimer(){ if(state.timer){clearInterval(state.timer);state.timer=null;} }
function toggleTime(){ timeHidden=!timeHidden; const el=$("#elapsed"); if(el) el.style.visibility=timeHidden?'hidden':'visible'; }
const hm = d => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

/* =========================================================== GRADE + SUBMIT */
function gradeFill(q){ const u=norm(q.resp); if(!u) return 0;
  return q.accept.some(a=>{const an=norm(a); return u===an||u.includes(an)||(an.includes(u)&&u.length>=3);})?q.pts:0; }
function gradeMatch(q){ let ok=0; q.left.forEach(l=>{ if(q.matchResp[l]===q.correct[l]) ok++; }); return Math.round((ok/q.left.length)*q.pts*100)/100; }
function estimateEssay(q){ if(!q.resp) return 0; const t=norm(q.resp); let h=0; q.keywords.forEach(k=>{ if(t.includes(norm(k))) h++; }); return Math.max(0,Math.min(5,Math.round((h/q.keywords.length)*6))); }

function submitQuiz(){
  const un = state.exam.filter(q=>!answered(q)).length;
  if(un>0 && !confirm(`${un} question(s) are unanswered. Submit anyway?`)) return;
  stopTimer();
  state.exam.forEach(q=>{
    if(q.t==="mc") q.earned=(q.resp===q.a)?q.pts:0;
    else if(q.t==="fill") q.earned=gradeFill(q);
    else if(q.t==="match") q.earned=gradeMatch(q);
    else if(q.t==="essay"){ q.estimate=estimateEssay(q); q.selfScore=q.estimate; q.earned=q.estimate; }
  });
  state.minutes = Math.max(1,Math.round((Date.now()-state.started)/60000));
  state.view="results"; state.review=null; persistAttempt(); renderResults(false);
}
function attemptScore(exam){ return exam.reduce((s,q)=> s + (q.t==="essay"?(q.selfScore??0):q.earned), 0); }

function persistAttempt(){
  const all=loadAtt(); const arr=all[state.quizId]||[];
  arr.push({ when:new Date().toLocaleString(), minutes:state.minutes,
    score:Math.round(attemptScore(state.exam)*10)/10, snapshot:JSON.parse(JSON.stringify(state.exam)) });
  all[state.quizId]=arr.slice(-12); saveAtt(all); state._attIndex=all[state.quizId].length-1;
}
function updatePersistedScore(){ const all=loadAtt(); const arr=all[state.quizId]; if(arr&&arr[state._attIndex]){ arr[state._attIndex].score=Math.round(attemptScore(state.exam)*10)/10; arr[state._attIndex].snapshot=JSON.parse(JSON.stringify(state.exam)); saveAtt(all);} }

/* =========================================================== RESULTS / REVIEW */
function reviewAttempt(id,idx){ const a=loadAtt()[id][idx]; state.quizId=id; state.exam=a.snapshot; state.minutes=a.minutes;
  state.view="results"; state.review={id,idx,when:a.when}; renderResults(true); }

function renderResults(readonly){
  const qz=QUIZZES.find(x=>x.id===state.quizId); const {total}=composeInfo(qz);
  const hasEssay = state.exam.some(q=>q.t==="essay");
  let html = `<h1>${esc(qz.title)}</h1>
    <div class="banner"><div id="scoreLine"></div>
      <p class="small muted" style="margin:8px 0 0">${state.review?`Reviewing attempt from ${esc(state.review.when)}`:`Submitted ${new Date().toLocaleString()}`} · ~${state.minutes} minute(s).</p></div>`;
  if(hasEssay && !readonly) html += `<div class="notice">📝 Essays are estimated by keyword coverage. Read the model answer and set your honest self-grade (0–5) — the score updates live.</div>`;
  html += `<div class="center"><button class="btn" onclick="openCover('${state.quizId}')">Back to quiz</button> &nbsp; <button class="btn g" onclick="startAttempt('${state.quizId}')">Take a new attempt</button> &nbsp; <button class="btn g" onclick="goQuizzes()">All quizzes</button></div>`;

  state.exam.forEach((q,i)=>{
    const full = q.t!=="essay" && q.earned>=q.pts-1e-9;
    const zero = q.t!=="essay" && q.earned<=1e-9;
    const cls = q.t==="essay"?"":(full?"correct":(zero?"wrong":"partial"));
    const tag = q.t==="essay"?"":(full?`<span class="tag cor">Correct</span>`:(zero?`<span class="tag inc">Incorrect</span>`:`<span class="tag par">Partial</span>`));
    let body="";
    if(q.t==="mc"){
      body=(q._opts||q.o).map(o=>{ const isA=o===q.a, isP=o===q.resp; let c=isA?"ans-correct":(isP&&!isA?"ans-wrong":"");
        let mk=isA?`<span class="mk g">✓ correct answer</span>`:(isP?`<span class="mk r">✗ your answer</span>`:"");
        return `<div class="opt ${c}"><span>${esc(o)}</span>${mk}</div>`; }).join("");
    } else if(q.t==="fill"){
      body=`<div class="opt ${q.earned>0?'ans-correct':'ans-wrong'}"><span>Your answer: <b>${esc(q.resp||'(blank)')}</b></span><span class="mk ${q.earned>0?'g':'r'}">${q.earned>0?'✓':'✗'}</span></div>
        <div class="opt ans-correct"><span>Accepted: <b>${q.accept.map(esc).join(' / ')}</b></span></div>`;
    } else if(q.t==="match"){
      body=q.left.map(l=>{ const ok=q.matchResp[l]===q.correct[l];
        return `<div class="match-row"><span class="ml">${esc(l)}</span><span style="flex:1">Your: <b>${esc(q.matchResp[l]||'—')}</b>${ok?'':` · Correct: <b>${esc(q.correct[l])}</b>`}</span><span class="res ${ok?'g':'r'}">${ok?'✓':'✗'}</span></div>`; }).join("");
    } else if(q.t==="essay"){
      const cur=q.selfScore??q.estimate;
      const btns=readonly? `<b>${cur} / 5</b>` : [0,1,2,3,4,5].map(v=>`<button class="gb ${cur===v?'sel':''}" onclick="setEssay(${q.uid},${v})">${v}</button>`).join("");
      body=`<div class="code">${esc(q.resp||'(no answer written)')}</div>
        <div class="model"><b>Model answer:</b> ${esc(q.model)}</div>
        <p class="small muted" style="margin-top:10px">Auto-estimate from keyword coverage: <b>${q.estimate}/5</b>.${readonly?'':' Set your honest self-grade:'}</p>
        <div class="grade" data-g="${q.uid}">${btns}${readonly?'':'<span class="small muted">/ 5</span>'}</div>`;
    }
    const earned = q.t==="essay"? (q.selfScore??q.estimate):Math.round(q.earned*100)/100;
    const code=q.code?`<div class="code">${esc(q.code)}</div>`:"";
    html+=`<div class="qwrap"><div class="qcard ${cls}">${tag}
      <div class="qhead"><span class="qn">Question ${i+1} <span class="small muted">· ${q.diff}</span></span><span class="pts" id="pts-${q.uid}">${earned} / ${q.pts} pts</span></div>
      <div class="qbody"><p class="qtext">${esc(q.q)}</p>${code}${body}
        ${q.e?`<div class="exp"><b>Explanation:</b> ${esc(q.e)}</div>`:''}</div></div></div>`;
  });

  paint(html,{nav:"",crumb:qz.title});
  drawScore();
}
function drawScore(){
  const qz=QUIZZES.find(x=>x.id===state.quizId); const {total}=composeInfo(qz);
  const sc=attemptScore(state.exam); const pct=Math.round(sc/total*100); const pass=sc>=total*0.8;
  const el=$("#scoreLine"); if(el) el.innerHTML=`<span class="scorebig">${Math.round(sc*10)/10}</span> / ${total} &nbsp; <span class="pill ${pass?'ok':'no'}">${pct}% — ${pass?'PASS (≥80%)':'below 80% target'}</span>`;
}
function setEssay(uid,v){ const q=state.exam.find(x=>x.uid===uid); q.selfScore=v;
  document.querySelectorAll(`[data-g="${uid}"] .gb`).forEach(b=>b.classList.toggle('sel',+b.textContent===v));
  const pe=$("#pts-"+uid); if(pe) pe.textContent=`${v} / ${q.pts} pts`;
  drawScore(); updatePersistedScore(); }

/* =========================================================== AUTH SCREEN */
let authMode = "login";
function renderAuth(msg){
  const login = authMode==="login";
  $("#root").innerHTML = `
    <div class="authpage">
      <div class="authcard">
        <div class="authlogo"><span class="lmark">${MARK_SVG}</span><span>Canv<span class="io">.io</span></span></div>
        <h1>${login?"Welcome back":"Create your account"}</h1>
        <p class="authsub">${login?"Log in to reach your courses and mock exams.":"Start rehearsing your exams in under a minute."}</p>
        ${msg?`<div class="autherr">${esc(msg)}</div>`:""}
        ${login?"":`<label class="fld">Name<input id="au-name" type="text" placeholder="Your name" autocomplete="name"></label>`}
        <label class="fld">Email<input id="au-email" type="email" placeholder="you@school.edu" autocomplete="email"></label>
        <label class="fld">Password<input id="au-pass" type="password" placeholder="••••••••" autocomplete="${login?'current-password':'new-password'}"></label>
        <button class="authbtn" onclick="doAuth()">${login?"Log in":"Create account"}</button>
        <div class="authswap">${login?"New to Canv.io?":"Already have an account?"} <a onclick="swapAuth()">${login?"Create an account":"Log in"}</a></div>
        <div class="authdemo"><b>Demo accounts</b><div>admin@canv.io · admin123</div><div>student@canv.io · student123</div></div>
      </div>
      <p class="authfoot">Canv.io — practise the exam, not just the notes.</p>
    </div>`;
  const em=$("#au-email"); if(em) em.focus();
  document.querySelectorAll(".authcard input").forEach(i=>i.addEventListener("keydown",e=>{ if(e.key==="Enter") doAuth(); }));
}
function swapAuth(){ authMode = authMode==="login"?"register":"login"; renderAuth(); }
function doAuth(){
  const email=($("#au-email")||{}).value, pass=($("#au-pass")||{}).value;
  let err;
  if(authMode==="login") err=login(email,pass);
  else err=register((($("#au-name")||{}).value)||"", email, pass);
  if(err) return renderAuth(err);
  renderCourses();
}

/* =========================================================== COURSES (home) */
const COURSES = [
  { id:"ai", name:"Artificial Intelligence", term:"AJ 2025 · Semester 2",
    desc:"Machine learning, deep learning, graph search & more. Mock exams drawn from a live question bank.",
    live:true },
];
function renderCourses(){
  stopTimer(); state.view="courses";
  const u=currentUser(); if(!u) return renderAuth();
  const att=loadAtt(); const totalAtt=Object.values(att).reduce((s,a)=>s+a.length,0);
  const cards = COURSES.map(c=>`
    <button class="ccard" onclick="goQuizzes()">
      <span class="cmark">${MARK_SVG}</span>
      <span class="cmeta"><span class="cname">${esc(c.name)}</span>
        <span class="cterm">${esc(c.term)}</span>
        <span class="cdesc">${esc(c.desc)}</span>
        <span class="cstat">${QUIZZES.length} mock exams${totalAtt?` · ${totalAtt} attempt${totalAtt>1?'s':''}`:''}</span></span>
    </button>`).join("");
  paint(`<h1>Welcome back, ${esc(u.name.split(" ")[0])}.</h1>
    <p class="muted small">Your courses and mock exams. Pick a course to start rehearsing — every attempt draws fresh questions.</p>
    <div class="ccards">${cards}</div>`,
    { rail:"Courses", bareNav:true, crumb:"Courses" });
}

/* =========================================================== PROFILE */
function renderProfile(){
  stopTimer(); state.view="profile";
  const u=currentUser(); if(!u) return renderAuth();
  const att=loadAtt(); const totalAtt=Object.values(att).reduce((s,a)=>s+a.length,0);
  const scores=Object.values(att).flat().map(a=>a.score); const best=scores.length?Math.max(...scores):null;
  paint(`<h1>Your profile</h1>
    <div class="profile">
      <span class="pava">${initials(u.name)}</span>
      <div><div class="pname">${esc(u.name)}</div><div class="muted">${esc(u.email)}</div>
        <span class="rolechip ${u.role}">${u.role}</span></div>
    </div>
    <div class="scards">
      <div class="scard"><div class="n">${COURSES.length}</div><div class="l">Enrolled courses</div></div>
      <div class="scard"><div class="n">${QUIZZES.length}</div><div class="l">Mock exams available</div></div>
      <div class="scard"><div class="n">${totalAtt}</div><div class="l">Attempts taken</div></div>
      <div class="scard"><div class="n">${best!=null?best:'—'}</div><div class="l">Best score</div></div>
    </div>
    <div class="rowbtns"><button class="btn" onclick="renderCourses()">My courses</button>
      <button class="btn g" onclick="renderSettings()">Settings</button></div>`,
    { rail:"Account", bareNav:true, crumb:"Profile" });
}

/* =========================================================== SETTINGS */
function renderSettings(){
  stopTimer(); state.view="settings";
  const u=currentUser(); if(!u) return renderAuth();
  paint(`<h1>Settings</h1>
    <div class="setblock">
      <h2>Profile</h2>
      <label class="fld">Display name<input id="set-name" type="text" value="${esc(u.name)}"></label>
      <div class="rowbtns"><button class="btn" onclick="saveName()">Save changes</button></div>
      <div id="set-msg" class="setmsg"></div>
    </div>
    <div class="setblock">
      <h2>Account</h2>
      <p class="muted small">Signed in as <b>${esc(u.email)}</b> (${u.role}).</p>
      <div class="rowbtns"><button class="btn g" onclick="resetProgress()">Reset my attempt history</button>
        <button class="btn danger" onclick="logout()">Sign out</button></div>
    </div>`,
    { rail:"Settings", bareNav:true, crumb:"Settings" });
}
function saveName(){
  const v=($("#set-name").value||"").trim(); if(!v) return;
  const us=loadUsers(); const u=us.find(x=>x.email===currentUser().email); u.name=v; saveUsers(us);
  const m=$("#set-msg"); if(m){ m.textContent="Saved."; m.className="setmsg ok"; }
}
function resetProgress(){
  if(!confirm("Delete all your saved attempts? This cannot be undone.")) return;
  localStorage.removeItem(attKey()); renderSettings();
}

/* =========================================================== ADMIN */
function renderAdmin(){
  stopTimer(); state.view="admin";
  const u=currentUser(); if(!u||u.role!=="admin") return renderCourses();
  const us=loadUsers()||[];
  const rows=us.map(x=>{
    const att=JSON.parse(localStorage.getItem("canvio_att_"+x.email)||"{}");
    const n=Object.values(att).reduce((s,a)=>s+a.length,0);
    return `<tr><td>${esc(x.name)}</td><td>${esc(x.email)}</td><td><span class="rolechip ${x.role}">${x.role}</span></td><td>${n}</td></tr>`;
  }).join("");
  paint(`<h1>Admin · Users</h1>
    <p class="muted small">${us.length} registered account${us.length>1?'s':''} on this device.</p>
    <table class="hist atbl"><tr><th>Name</th><th>Email</th><th>Role</th><th>Attempts</th></tr>${rows}</table>
    <p class="muted small" style="margin-top:14px">In production this is served by the backend (real auth + database). Here it reads local accounts for the demo.</p>`,
    { rail:"Admin", bareNav:true, crumb:"Admin" });
}

/* ---------- boot ---------- */
function boot(){ seedUsers(); if(currentUser()) renderCourses(); else renderAuth(); }
boot();
