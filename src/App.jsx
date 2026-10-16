import React,{useEffect,useMemo,useState}from'react';
const D={calMinKg:0,calMaxKg:100,minV:.22,maxV:4.75,sliderMinKg:-10,sliderMaxKg:100,kg:0};
const load=()=>{try{return{...D,...JSON.parse(localStorage.getItem('hopper-scale-v2')||'{}')}}catch{return D}};
const clamp=(n,a,b)=>Math.min(Math.max(n,a),b);
export default function App(){
 const i=load();const[calMinKg,setCalMinKg]=useState(i.calMinKg),[calMaxKg,setCalMaxKg]=useState(i.calMaxKg),[minV,setMinV]=useState(i.minV),[maxV,setMaxV]=useState(i.maxV),[sliderMinKg,setSliderMinKg]=useState(i.sliderMinKg),[sliderMaxKg,setSliderMaxKg]=useState(i.sliderMaxKg),[kg,setKg]=useState(i.kg),[online,setOnline]=useState(navigator.onLine),[prompt,setPrompt]=useState(null);
 const calibrationValid=calMaxKg>calMinKg&&maxV!==minV,sliderValid=sliderMaxKg>sliderMinKg,valid=calibrationValid&&sliderValid;
 const kgToV=w=>minV+((w-calMinKg)/(calMaxKg-calMinKg))*(maxV-minV);
 const vToKg=v=>calMinKg+((v-minV)/(maxV-minV))*(calMaxKg-calMinKg);
 const voltage=calibrationValid?kgToV(kg):0;
 const fillPercent=calMaxKg>0?clamp((Math.max(0,kg)/calMaxKg)*100,0,100):0;
 const emptyWeight=kg<0?Math.abs(kg):0;
 useEffect(()=>localStorage.setItem('hopper-scale-v2',JSON.stringify({calMinKg,calMaxKg,minV,maxV,sliderMinKg,sliderMaxKg,kg})),[calMinKg,calMaxKg,minV,maxV,sliderMinKg,sliderMaxKg,kg]);
 useEffect(()=>{const n=()=>setOnline(navigator.onLine),p=e=>{e.preventDefault();setPrompt(e)};addEventListener('online',n);addEventListener('offline',n);addEventListener('beforeinstallprompt',p);return()=>{removeEventListener('online',n);removeEventListener('offline',n);removeEventListener('beforeinstallprompt',p)}},[]);
 const points=useMemo(()=>[0,25,50,75,100].map(p=>{const w=calMaxKg*p/100;return{p,w,v:calibrationValid?kgToV(w):0}}),[calMinKg,calMaxKg,minV,maxV,calibrationValid]);
 const num=s=>e=>s(e.target.value===''?'':Number(e.target.value));const setWeight=v=>setKg(clamp(Number(v)||0,Number(sliderMinKg),Number(sliderMaxKg)));
 const reset=()=>{setCalMinKg(D.calMinKg);setCalMaxKg(D.calMaxKg);setMinV(D.minV);setMaxV(D.maxV);setSliderMinKg(D.sliderMinKg);setSliderMaxKg(D.sliderMaxKg);setKg(D.kg)};
 const install=async()=>{if(prompt){await prompt.prompt();setPrompt(null)}};
 return <main className="shell">
  <header className="hero card"><div><span className="eyebrow">КАЛІБРУВАЛЬНИЙ ІНСТРУМЕНТ</span><h1>Бункерні ваги</h1><p>Тарування тензодатчика та візуалізація заповнення</p></div><div className="actions"><span className={'status '+(online?'ok':'off')}>● {online?'Онлайн':'Офлайн'}</span>{prompt&&<button className="button primary" onClick={install}>Встановити</button>}<button className="button" onClick={reset}>Скинути</button></div></header>
  <section className="layout">
   <aside className="settings">
    <div className="card panel"><h2>Точки тарування</h2><p className="hint">Ці значення визначають формулу «вага ↔ напруга».</p><div className="fields"><Field label="Мінімальна вага тарування" unit="кг" value={calMinKg} step="0.01" onChange={num(setCalMinKg)}/><Field label="Максимальна вага тарування" unit="кг" value={calMaxKg} step="0.01" onChange={num(setCalMaxKg)}/><Field label="Напруга при мінімумі" unit="В" value={minV} step="0.001" onChange={num(setMinV)}/><Field label="Напруга при максимумі" unit="В" value={maxV} step="0.001" onChange={num(setMaxV)}/></div></div>
    <div className="card panel"><h2>Межі повзунка</h2><p className="hint">Лише робочий діапазон ручного керування.</p><div className="fields two"><Field label="Мінімум повзунка" unit="кг" value={sliderMinKg} step="0.01" onChange={num(setSliderMinKg)}/><Field label="Максимум повзунка" unit="кг" value={sliderMaxKg} step="0.01" onChange={num(setSliderMaxKg)}/></div>{!valid&&<p className="error">Перевірте межі тарування та повзунка.</p>}</div>
   </aside>
   <section className="card calculator"><div className="calcHead"><Metric label="Поточна вага" value={Number(kg).toFixed(2)} unit="кг"/><Metric blue label="Вихід" value={Number(voltage).toFixed(3)} unit="В"/></div>
    <label className="inputLabel">Введіть вагу</label><div className="bigInput"><input type="number" inputMode="decimal" min={sliderMinKg} max={sliderMaxKg} step="0.01" value={kg} onChange={e=>setWeight(e.target.value)}/><span>кг</span></div>
    <input className="range" type="range" min={sliderMinKg} max={sliderMaxKg} step="0.01" value={kg} onChange={e=>setWeight(e.target.value)}/><div className="scale"><span>{Number(sliderMinKg).toFixed(2)} кг</span><b>Крок 0,01 кг</b><span>{Number(sliderMaxKg).toFixed(2)} кг</span></div>
    <div className="hopperWrap"><div className="hopper"><div className="grain" style={{height:`${fillPercent}%`}}></div><div className="hopperText"><strong>{fillPercent.toFixed(2)}%</strong><span>{kg<0?'Порожня тара':'Заповнення'}</span></div></div><div className="fillInfo"><span>Рівень заповнення</span><strong>{fillPercent.toFixed(2)}%</strong><div className="fillBar"><i style={{width:`${fillPercent}%`}}/></div><p>{kg<0?`Від’ємна вага ${Number(kg).toFixed(2)} кг враховується як порожня тара. Заповнення: 0%.`:`Розрахунок від 0 до ${Number(calMaxKg).toFixed(2)} кг за максимальною шкалою.`}</p>{emptyWeight>0&&<small>Відхилення нуля: −{emptyWeight.toFixed(2)} кг</small>}</div></div>
    <div className="reverse"><label>Або введіть напругу</label><div><input type="number" inputMode="decimal" step="0.001" value={Number(voltage).toFixed(3)} onChange={e=>calibrationValid&&setWeight(vToKg(Number(e.target.value)))}/><span>В</span></div></div>
   </section>
  </section>
  <section className="card tableCard"><h2>Контрольні точки заповнення бункера</h2><p className="hint">Відсоток завжди відраховується від 0 кг до максимальної ваги тарування.</p><div className="points">{points.map(x=><div className="point" key={x.p}><span>{x.p}%</span><b>{x.w.toFixed(2)} кг</b><strong>{x.v.toFixed(3)} В</strong></div>)}</div></section><footer>Налаштування автоматично зберігаються на пристрої.</footer>
 </main>
}
function Field({label,unit,...p}){return <label className="field"><span>{label}</span><div><input type="number" inputMode="decimal" {...p}/><b>{unit}</b></div></label>};function Metric({label,value,unit,blue}){return <div className={blue?'metric blue':'metric'}><span>{label}</span><strong>{value} <small>{unit}</small></strong></div>}
