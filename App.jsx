import React, { useEffect, useMemo, useState } from 'react'
const defaults={minV:0.22,maxV:4.75,minKg:-10,maxKg:100,kg:80}
const read=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem('loadcell-settings')||'{}')}}catch{return defaults}}
const clamp=(n,a,b)=>Math.min(Math.max(n,a),b)
export default function App(){
  const initial=read(); const [minV,setMinV]=useState(initial.minV); const [maxV,setMaxV]=useState(initial.maxV)
  const [minKg,setMinKg]=useState(initial.minKg); const [maxKg,setMaxKg]=useState(initial.maxKg); const [kg,setKg]=useState(initial.kg)
  const [online,setOnline]=useState(navigator.onLine); const [installPrompt,setInstallPrompt]=useState(null)
  const valid=maxV!==minV&&maxKg!==minKg&&maxKg>minKg
  const kgToV=(w)=>minV+((w-minKg)/(maxKg-minKg))*(maxV-minV)
  const vToKg=(v)=>minKg+((v-minV)/(maxV-minV))*(maxKg-minKg)
  const voltage=valid?kgToV(kg):0
  const progress=valid?clamp(((kg-minKg)/(maxKg-minKg))*100,0,100):0
  useEffect(()=>localStorage.setItem('loadcell-settings',JSON.stringify({minV,maxV,minKg,maxKg,kg})),[minV,maxV,minKg,maxKg,kg])
  useEffect(()=>{const on=()=>setOnline(navigator.onLine);const before=e=>{e.preventDefault();setInstallPrompt(e)};addEventListener('online',on);addEventListener('offline',on);addEventListener('beforeinstallprompt',before);return()=>{removeEventListener('online',on);removeEventListener('offline',on);removeEventListener('beforeinstallprompt',before)}},[])
  const points=useMemo(()=>[0,25,50,75,100].map(p=>{const w=minKg+(maxKg-minKg)*p/100;return {p,w,v:valid?kgToV(w):0}}),[minV,maxV,minKg,maxKg,valid])
  const number=(setter)=>(e)=>setter(e.target.value===''?'':Number(e.target.value))
  const setWeight=(value)=>setKg(clamp(Number(value)||0,Number(minKg),Number(maxKg)))
  const install=async()=>{if(installPrompt){await installPrompt.prompt();setInstallPrompt(null)}}
  const reset=()=>{setMinV(defaults.minV);setMaxV(defaults.maxV);setMinKg(defaults.minKg);setMaxKg(defaults.maxKg);setKg(defaults.kg)}
  return <main className="shell"><section className="hero card"><div><span className="eyebrow">КАЛІБРУВАЛЬНИЙ ІНСТРУМЕНТ</span><h1>Тензодатчик</h1><p>Розрахунок ваги ↔ напруги з офлайн-доступом</p></div><div className="actions"><span className={'status '+(online?'ok':'off')}>{online?'● Онлайн':'● Офлайн'}</span>{installPrompt&&<button className="button primary" onClick={install}>Встановити</button>}<button className="button" onClick={reset}>Скинути</button></div></section>
  <section className="layout"><div className="card settings"><h2>Межі шкали</h2><div className="fields"><Field label="Мінімальна вага" unit="кг" value={minKg} step="0.01" onChange={number(setMinKg)}/><Field label="Максимальна вага" unit="кг" value={maxKg} step="0.01" onChange={number(setMaxKg)}/><Field label="Мінімальна напруга" unit="В" value={minV} step="0.001" onChange={number(setMinV)}/><Field label="Максимальна напруга" unit="В" value={maxV} step="0.001" onChange={number(setMaxV)}/></div>{!valid&&<p className="error">Перевірте межі: максимум має бути більшим за мінімум.</p>}</div>
  <div className="card calculator"><div className="calcHead"><div><span className="label">Поточна вага</span><strong>{Number(kg).toFixed(2)} <small>кг</small></strong></div><div className="voltage"><span className="label">Вихід</span><strong>{Number(voltage).toFixed(3)} <small>В</small></strong></div></div>
  <label className="inputLabel" htmlFor="weight">Введіть вагу</label><div className="bigInput"><input id="weight" inputMode="decimal" type="number" min={minKg} max={maxKg} step="0.01" value={kg} onChange={e=>setWeight(e.target.value)}/><span>кг</span></div>
  <input aria-label="Повзунок ваги" className="range" type="range" min={minKg} max={maxKg} step="0.01" value={kg} onChange={e=>setWeight(e.target.value)}/><div className="scale"><span>{Number(minKg).toFixed(2)} кг</span><b>{progress.toFixed(2)}%</b><span>{Number(maxKg).toFixed(2)} кг</span></div>
  <div className="reverse"><label>Або введіть напругу</label><div><input inputMode="decimal" type="number" step="0.001" value={Number(voltage).toFixed(3)} onChange={e=>valid&&setWeight(vToKg(Number(e.target.value)))}/><span>В</span></div></div></div></section>
  <section className="card tableCard"><div><h2>Контрольні точки</h2><p>Автоматично перераховуються відповідно до меж</p></div><div className="points">{points.map(x=><div className="point" key={x.p}><span>{x.p}%</span><b>{x.w.toFixed(2)} кг</b><strong>{x.v.toFixed(3)} В</strong></div>)}</div></section><footer>Налаштування зберігаються локально на цьому пристрої.</footer></main>
}
function Field({label,unit,...props}){return <label className="field"><span>{label}</span><div><input type="number" inputMode="decimal" {...props}/><b>{unit}</b></div></label>}
