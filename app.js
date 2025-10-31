// Basic navigation
document.querySelectorAll('[data-screen]').forEach(btn=>{
  btn.addEventListener('click', ()=> showScreen(btn.getAttribute('data-screen')));
});
document.querySelectorAll('.btn[data-screen]').forEach(b=>b.addEventListener('click', e=> showScreen(e.target.getAttribute('data-screen'))));

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  const speech = document.getElementById('speech');
  if(id==='notes') speech.textContent = 'Vamos anotar! 📝';
  if(id==='calc') speech.textContent = 'Vamos calcular! ➕';
  if(id==='timer') speech.textContent = 'Cronômetro pronto ⏱️';
  if(id==='about') speech.textContent = 'Sobre o Silício 🤖';
  if(id==='home') speech.textContent = 'Olá! Eu sou o Silício 🤖';
}

// initial
showScreen('home');

// Theme handling
const themeToggle = document.getElementById('themeToggle');
const storedTheme = localStorage.getItem('silicio_theme') || 'dark';
document.documentElement.setAttribute('data-theme', storedTheme);
themeToggle.addEventListener('click', ()=>{
  const next = document.documentElement.getAttribute('data-theme')==='dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('silicio_theme', next);
});

// Notes functionality
const notesKey = 'silicio_notes';
let notes = JSON.parse(localStorage.getItem(notesKey)||'[]');
const notesList = document.getElementById('notesList');
const noteTitle = document.getElementById('noteTitle');
const noteBody = document.getElementById('noteBody');
function renderNotes(){
  notesList.innerHTML='';
  notes.forEach((n,i)=>{
    const div = document.createElement('div'); div.className='note-item';
    const left = document.createElement('div'); left.innerHTML=`<strong>${n.title||'Sem título'}</strong><div style="font-size:0.85rem;color:#ccc">${(n.body||'').slice(0,80)}</div>`;
    const right = document.createElement('div');
    const open = document.createElement('button'); open.className='btn'; open.textContent='Abrir'; open.onclick=()=>{ noteTitle.value=n.title; noteBody.value=n.body; currentIndex=i; };
    const del = document.createElement('button'); del.className='btn'; del.textContent='Excluir'; del.onclick=()=>{ if(confirm('Excluir nota?')){ notes.splice(i,1); saveNotes(); renderNotes(); }};
    right.appendChild(open); right.appendChild(del);
    div.appendChild(left); div.appendChild(right);
    notesList.appendChild(div);
  });
}
function saveNotes(){ localStorage.setItem(notesKey, JSON.stringify(notes)); }
let currentIndex = -1;
document.getElementById('saveNote').addEventListener('click', ()=>{
  const t = noteTitle.value.trim(), b = noteBody.value.trim();
  if(currentIndex>=0){ notes[currentIndex] = {title:t, body:b, updated:Date.now()}; currentIndex=-1; }
  else notes.unshift({title:t, body:b, created:Date.now()});
  noteTitle.value=''; noteBody.value=''; saveNotes(); renderNotes();
});
document.getElementById('newNote').addEventListener('click', ()=>{ currentIndex=-1; noteTitle.value=''; noteBody.value=''; });
document.getElementById('exportNotes').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(notes, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'silicio-notes.json'; a.click(); URL.revokeObjectURL(url);
});
renderNotes();

// Calculator logic
const display = document.getElementById('calcDisplay');
let calcVal = '';
document.querySelectorAll('.key').forEach(k=>{
  k.addEventListener('click', ()=>{
    const v = k.getAttribute('data-val');
    if(v==='='){ try{ calcVal = String(eval(calcVal)); }catch(e){ calcVal='Error' } display.value = calcVal; return; }
    if(k.id==='calcEquals'){ try{ calcVal = String(eval(calcVal)); }catch(e){ calcVal='Error' } display.value = calcVal; return; }
    calcVal += v; display.value = calcVal;
  });
});
document.getElementById('calcEquals').addEventListener('click', ()=>{
  try{ calcVal = String(eval(calcVal)); }catch(e){ calcVal='Error' } display.value = calcVal;
});

// Timer / stopwatch
let startTime = 0, elapsed = 0, timerInterval = null;
const timerDisplay = document.getElementById('timerDisplay');
const lapsEl = document.getElementById('laps');
document.getElementById('startStop').addEventListener('click', ()=>{
  if(!timerInterval){ startTime = Date.now() - elapsed; timerInterval = setInterval(()=>{ elapsed = Date.now() - startTime; timerDisplay.textContent = formatTime(elapsed); }, 50); document.getElementById('startStop').textContent='Pausar'; }
  else { clearInterval(timerInterval); timerInterval = null; document.getElementById('startStop').textContent='Continuar'; }
});
document.getElementById('reset').addEventListener('click', ()=>{ clearInterval(timerInterval); timerInterval=null; elapsed=0; timerDisplay.textContent='00:00:00.00'; lapsEl.innerHTML=''; document.getElementById('startStop').textContent='Iniciar'; });
document.getElementById('lap').addEventListener('click', ()=>{ if(!elapsed) return; const li = document.createElement('li'); li.textContent = formatTime(elapsed); lapsEl.appendChild(li); });
function formatTime(ms){ const cent = Math.floor((ms%1000)/10); const s = Math.floor(ms/1000)%60; const m = Math.floor(ms/60000)%60; const h = Math.floor(ms/3600000); return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cent).padStart(2,'0')}`; }
