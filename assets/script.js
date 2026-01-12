(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const state = { sound:false, clicks:0, lastActivity:Date.now(), start:Date.now(), idleTimer:null };

  let audioCtx=null;
  function ensureAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
  function playStamp(){
    if(!state.sound) return;
    try{
      const ctx=ensureAudio(); const t=ctx.currentTime;
      const o=ctx.createOscillator(); const g=ctx.createGain();
      o.type="triangle";
      o.frequency.setValueAtTime(240,t);
      o.frequency.exponentialRampToValueAtTime(110,t+0.05);
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.05,t+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+0.08);
    }catch(e){}
  }
  function playBell(){
    if(!state.sound) return;
    try{
      const ctx=ensureAudio(); const t=ctx.currentTime;
      const o=ctx.createOscillator(); const g=ctx.createGain();
      o.type="sine";
      o.frequency.setValueAtTime(880,t);
      o.frequency.exponentialRampToValueAtTime(660,t+0.2);
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.06,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+0.36);
    }catch(e){}
  }
  function setSoundUI(){
    const btn=$("#soundToggle"); if(!btn) return;
    btn.textContent = state.sound ? "Sound: ON" : "Sound: OFF";
  }
  function initSound(){
    const btn=$("#soundToggle"); if(!btn) return;
    state.sound = localStorage.getItem("idle_sound_v1")==="on";
    setSoundUI();
    btn.addEventListener("click", async ()=>{
      try{ ensureAudio(); if(audioCtx && audioCtx.state==="suspended") await audioCtx.resume(); }catch(e){}
      state.sound=!state.sound;
      localStorage.setItem("idle_sound_v1", state.sound?"on":"off");
      setSoundUI(); playStamp();
    });
  }

  const marginalia = {
    coldOpen:[
      "Welcome. Please stop pretending you’re ‘researching.’",
      "You’re here to be seen by the work, not by people.",
      "The workshop accepts unfinished artifacts only.",
      "Your standards are not a personality. They’re a delay tactic.",
      "Name what you’re doing."
    ],
    idle:[
      "Still rehearsing?",
      "Your silence is expensive.",
      "If it’s rest, rest. If it’s avoidance, admit it.",
      "You can think forever. That’s why you’re dangerous to yourself."
    ],
    frantic:[
      "Motion detected. Progress unverified.",
      "You’re clicking like that counts.",
      "Speed is not courage.",
      "You are shopping for relief."
    ],
    tab:[
      "Tab switch logged.",
      "You left. The work stayed.",
      "Visibility change detected. The devil kept time."
    ],
    confession:[
      "Good. Now stop narrating it.",
      "Honesty accepted. Forgiveness pending.",
      "You said the truth. That is the entire ritual."
    ],
    lotteryWin:[
      "Absolution granted. Don’t monetize it.",
      "You’re allowed to do nothing. Don’t turn it into a project.",
      "A rare permission. Use it quietly."
    ]
  };

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function setMarginalia(text, label="Marginalia"){
    const box=$("#marginaliaText"), lab=$("#marginaliaLabel");
    if(!box||!lab) return;
    box.textContent=text; lab.textContent=label;
  }

  function initMarginalia(){
    if(!$("#marginaliaText")) return;
    setMarginalia(pick(marginalia.coldOpen),"Marginalia");
    const bump=()=>{ state.lastActivity=Date.now(); };
    ["mousemove","keydown","scroll","touchstart"].forEach(ev=>window.addEventListener(ev,bump,{passive:true}));
    state.idleTimer=setInterval(()=>{
      const idleMs=Date.now()-state.lastActivity;
      if(idleMs>22000) setMarginalia(pick(marginalia.idle),"Idle");
      else if(state.clicks>=8 && (Date.now()-state.start)<12000) setMarginalia(pick(marginalia.frantic),"Motion");
    },3500);
    document.addEventListener("visibilitychange", ()=>{
      if(document.hidden) setMarginalia(pick(marginalia.tab),"Witness");
    });
  }

  function initCardLight(){
    $$(".card").forEach(card=>{
      card.addEventListener("mousemove",(e)=>{
        const r=card.getBoundingClientRect();
        const mx=((e.clientX-r.left)/r.width)*100;
        const my=((e.clientY-r.top)/r.height)*100;
        card.style.setProperty("--mx", mx+"%");
        card.style.setProperty("--my", my+"%");
      });
    });
  }

  function initReveals(){
    const els=$$("h1, .card, .grid, blockquote, pre").filter(el=>!el.classList.contains("reveal"));
    els.forEach(el=>el.classList.add("reveal"));
    const io=new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
      });
    },{threshold:0.12});
    $$(".reveal").forEach(el=>io.observe(el));
  }

  function initTransitions(){
    document.addEventListener("click",(e)=>{
      const a=e.target.closest("a"); if(!a) return;
      const href=a.getAttribute("href"); if(!href) return;
      if(href.startsWith("http")||href.startsWith("#")) return;
      e.preventDefault();
      playStamp();
      document.body.classList.add("fade-out");
      setTimeout(()=>{ window.location.href=href; },160);
    });
  }

  function initCursor(){
    const dot=$("#cursorDot"); if(!dot) return;
    let raf=null, x=0,y=0, tx=0,ty=0;
    const tick=()=>{
      x+=(tx-x)*0.25; y+=(ty-y)*0.25;
      dot.style.left=x+"px"; dot.style.top=y+"px";
      raf=requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove",(e)=>{
      dot.classList.add("on");
      tx=e.clientX; ty=e.clientY;
      if(!raf) raf=requestAnimationFrame(tick);
    },{passive:true});
    document.addEventListener("mouseover",(e)=>{
      dot.classList.toggle("big", !!e.target.closest("a, button, input, textarea"));
    });
  }

  function floatPrayer(text){
    const el=document.createElement("div");
    el.className="prayer";
    el.style.setProperty("--x",(20+Math.random()*60)+"%");
    el.style.setProperty("--y",(68+Math.random()*12)+"%");
    el.textContent=text;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),3000);
  }

  function initConfessional(){
    const form=$("#confessionForm"), input=$("#confessionText"), feed=$("#confessionFeed");
    if(!form||!input||!feed) return;
    const KEY="idle_confessions_v2";
    const seed=[
      "I rehearsed a brave conversation for 38 minutes and said nothing.",
      "I reorganized my bookmarks like it was a personality.",
      "I refreshed my inbox as if emails are prey animals.",
      "I wrote a perfect plan in my head and then took a nap.",
      "I opened a doc titled FINAL_FINAL_v7 and felt absolved."
    ];
    function read(){
      try{
        const raw=localStorage.getItem(KEY);
        if(!raw){
          const seeded=seed.map(t=>({id:(crypto.randomUUID?.()||String(Math.random())), t, at:new Date().toISOString()}));
          localStorage.setItem(KEY, JSON.stringify(seeded));
        }
        return JSON.parse(localStorage.getItem(KEY)||"[]");
      }catch(e){ return []; }
    }
    function write(items){ localStorage.setItem(KEY, JSON.stringify(items.slice(0,120))); }
    function burn(id, cardEl){
      write(read().filter(x=>x.id!==id));
      cardEl.classList.add("burn");
      setTimeout(()=>cardEl.remove(),650);
      playStamp();
      setMarginalia(pick(marginalia.confession),"Confession");
    }
    function render(){
      const items=read();
      feed.innerHTML="";
      items.slice().reverse().forEach(item=>{
        const card=document.createElement("div");
        card.className="card";
        const date=new Date(item.at);
        card.innerHTML=`
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
            <span class="badge">${date.toLocaleString()}</span>
            <button class="burnBtn" data-id="${item.id}" title="Burn this confession">Burn</button>
          </div>
          <p style="margin-top:10px">${String(item.t).replace(/[<>]/g,"")}</p>
        `;
        feed.appendChild(card);
      });
      $$(".burnBtn", feed).forEach(btn=>{
        btn.addEventListener("click", ()=>{
          const id=btn.getAttribute("data-id");
          const card=btn.closest(".card");
          if(id && card) burn(id, card);
        });
      });
    }
    form.addEventListener("submit",(e)=>{
      e.preventDefault();
      const t=input.value.trim(); if(!t) return;
      const items=read();
      items.push({id:(crypto.randomUUID?.()||String(Math.random())), t:t.slice(0,280), at:new Date().toISOString()});
      write(items);
      input.value="";
      render();
      floatPrayer(t.slice(0,140));
      playStamp();
      setMarginalia(pick(marginalia.confession),"Confession");
    });
    $("#confessionClear")?.addEventListener("click", ()=>{
      localStorage.removeItem(KEY); playStamp(); render();
    });
    render();
  }

  function initTimesheet(){
    const out=$("#timesheetOut"), btn=$("#timesheetGen"), copy=$("#timesheetCopy");
    if(!out||!btn) return;
    const rows=["Rumination","Premature Optimization","Inbox Necromancy","Calendar Rehearsal","Refreshing the Feed","Opening Tabs (Archaeology)","Micro-Planning","Searching for the Perfect Tool","Self-Explanation","Guilt","Reading About Doing","Watching Someone Else Do It"];
    const rand=n=>Math.floor(Math.random()*n);
    function generate(){
      const stamp=new Date().toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});
      const picks=[]; const used=new Set();
      while(picks.length<8){ const r=rows[rand(rows.length)]; if(used.has(r)) continue; used.add(r); picks.push(r); }
      const hours=picks.map(()=>Math.round((Math.random()*8+1)*10)/10);
      picks.push("Actual Work"); hours.push(Math.round((Math.random()*0.4+0.1)*10)/10);
      const lines=[]; lines.push("DEVIL'S TIMESHEET"); lines.push(`Week of ${stamp}`); lines.push("");
      const maxLabel=Math.max(...picks.map(x=>x.length));
      let total=0;
      for(let i=0;i<picks.length;i++){ total+=hours[i]; lines.push(`${picks[i].padEnd(maxLabel)}  ${String(hours[i]).padStart(4)}h`); }
      lines.push(""); lines.push(`Total: ${Math.round(total*10)/10}h`); lines.push("Approval: DENIED (try again next week).");
      out.textContent=lines.join("\n");
      floatPrayer("Audit complete."); playStamp();
    }
    btn.addEventListener("click", generate);
    copy?.addEventListener("click", async ()=>{
      try{ await navigator.clipboard.writeText(out.textContent); copy.textContent="Copied."; setTimeout(()=>copy.textContent="Copy",900); playStamp(); }
      catch(e){ copy.textContent="Select + copy manually."; setTimeout(()=>copy.textContent="Copy",1200); }
    });
    generate();
  }

  function initLottery(){
    const box=$("#lotteryBox"), btn=$("#lotteryBtn");
    if(!box||!btn) return;
    function hash(str){
      let h=2166136261;
      for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24); }
      return Math.abs(h>>>0);
    }
    function todayKey(){
      const d=new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    }
    function run(){
      const key=todayKey();
      const id=`${key}|${navigator.userAgent}|${screen.width}x${screen.height}`;
      const h=hash(id);
      const win=(h%37)===0;
      const dateLabel=new Date().toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});
      if(win){
        box.innerHTML=`
          <div class="card">
            <div class="badge">Absolution Granted • ${dateLabel}</div>
            <h2 style="margin-top:12px">Congratulations.</h2>
            <p>Today you are permitted to do nothing. Guilt-free. Say it out loud once, then stop talking about it.</p>
            <p class="small">Terms: no “just one more thing.” No “I should at least…” No heroics.</p>
          </div>`;
        setMarginalia(pick(marginalia.lotteryWin),"Decree");
        playBell(); floatPrayer("Absolution.");
      }else{
        const reasons=["Return tomorrow for absolution.","The workshop is full. Try again.","Your ambition was detected. Please leave the premises.","Denied. For your own sanctification.","Denied. The devil is currently onboarding."];
        box.innerHTML=`
          <div class="card">
            <div class="badge">Absolution Pending • ${dateLabel}</div>
            <h2 style="margin-top:12px">Not today.</h2>
            <p>${reasons[h%reasons.length]}</p>
            <p class="small">If you must idle, do it honestly. Don’t call it “research.”</p>
          </div>`;
        playStamp();
      }
    }
    btn.addEventListener("click", run);
    run();
  }

  function initDiagnostic(){
    const form=$("#diagForm"), out=$("#diagOut");
    if(!form||!out) return;
    const types=[
      {name:"The Visionary Avoider", line:"Your mind builds cathedrals so your hands never pour concrete.", advice:"Pick one task that can be finished in 12 minutes. Stop at finished, not improved."},
      {name:"The Spreadsheet Mystic", line:"You ritualize numbers to avoid the embarrassment of shipping.", advice:"Write the ugliest version first. Measure only ‘published or not.’"},
      {name:"The Tab Archaeologist", line:"You excavate knowledge like it will love you back.", advice:"Close 20 tabs. Keep one. Do the next physical action it implies."},
      {name:"The Saint of Delay", line:"You postpone so gracefully it looks like integrity.", advice:"Set a timer for 7 minutes. Start badly. Stop when it rings."}
    ];
    function score(ans){
      const sum=ans.reduce((a,b)=>a+b,0);
      if(sum<=7) return types[3];
      if(sum<=9) return types[0];
      if(sum<=11) return types[1];
      return types[2];
    }
    form.addEventListener("submit",(e)=>{
      e.preventDefault();
      const values=$$("input[type=radio]:checked", form).map(r=>parseInt(r.value,10));
      if(values.length<4){ out.innerHTML=`<div class="card"><p>Please answer all questions. The devil prefers complete forms.</p></div>`; return; }
      const t=score(values);
      out.innerHTML=`
        <div class="card">
          <div class="badge">Result</div>
          <h2 style="margin-top:12px">${t.name}</h2>
          <p>${t.line}</p>
          <hr/>
          <p class="muted">Prescription (non-binding):</p>
          <p>${t.advice}</p>
          <p class="small">Note: this diagnosis is spiritually inadmissible in any court.</p>
        </div>`;
      floatPrayer("Diagnosis rendered."); playStamp();
      out.scrollIntoView({behavior:"smooth", block:"start"});
    });
  }

  function initWorkshop(){
    const list=document.getElementById("courseList");
    if(!list) return;
    $$("#courseList button[data-course]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const course=btn.getAttribute("data-course");
        btn.textContent="Enrolled (in theory).";
        playStamp();
        setTimeout(()=>btn.textContent=`Enroll in ${course}`,1200);
      });
    });
  }

  function initClickCounter(){
    document.addEventListener("click",(e)=>{
      if(e.target.closest("a, button")) state.clicks += 1;
      state.lastActivity=Date.now();
    },{passive:true});
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    initSound(); initMarginalia(); initClickCounter(); initCardLight(); initReveals(); initTransitions(); initCursor();
    initConfessional(); initTimesheet(); initLottery(); initDiagnostic(); initWorkshop();
  });
})();
