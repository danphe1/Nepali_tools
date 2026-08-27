"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Answer = { name: string; option: number };
type NewsItem = { source: string; title: string; url: string };
const defaultQuestion = { text: "नेपालको राष्ट्रिय फूल कुन हो?", options: ["लालीगुराँस", "कमल", "सयपत्री", "सुनाखरी"], correct: 0 };
const seedNews = [
  ["Onlinekhabar", "नेपालका आजका मुख्य समाचार", "https://www.onlinekhabar.com/"],
  ["Setopati", "राजनीति, समाज र अर्थतन्त्रका ताजा खबर", "https://www.setopati.com/"],
  ["Kantipur", "नेपाल तथा विश्वका महत्वपूर्ण समाचार", "https://ekantipur.com/"],
  ["Baahrakhari", "ब्रेकिङ र बहसका विषय", "https://baahrakhari.com/"],
  ["TechPana", "नेपालको प्रविधि र डिजिटल समाचार", "https://techpana.com/"]
];

function nepaliDigits(value: number) { return value.toString().replace(/\d/g, d => "०१२३४५६७८९"[Number(d)]); }
function getSessionKey(id: string) { return `nt-session-${id}`; }
function uuid() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

export default function Home() {
  const [tab, setTab] = useState<"home" | "host" | "join">("home");
  const [seconds, setSeconds] = useState(300);
  const [running, setRunning] = useState(false);
  const [question, setQuestion] = useState(defaultQuestion);
  const [sessionId, setSessionId] = useState("");
  const [name, setName] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comments, setComments] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  const joinUrl = useMemo(() => typeof window === "undefined" ? "" : `${window.location.origin}?join=${sessionId}`, [sessionId]);

  useEffect(() => { const id = new URLSearchParams(window.location.search).get("join"); if (id) { setSessionId(id); setTab("join"); const raw = localStorage.getItem(getSessionKey(id)); if (raw) { const s = JSON.parse(raw); setQuestion(s.question); setAnswers(s.answers || []); setComments(s.comments || []); } } }, []);
  useEffect(() => { fetch("/api/news").then(r => r.ok ? r.json() : []).then(setHeadlines).catch(() => undefined); }, []);
  useEffect(() => { if (!running || seconds <= 0) return; const timer = window.setInterval(() => setSeconds(x => x - 1), 1000); return () => clearInterval(timer); }, [running, seconds]);
  useEffect(() => { if (sessionId) localStorage.setItem(getSessionKey(sessionId), JSON.stringify({ question, answers, comments })); }, [sessionId, question, answers, comments]);
  const startSession = () => { const id = uuid(); setSessionId(id); setAnswers([]); setComments([]); setSeconds(300); setRunning(true); };
  const submit = (e: FormEvent) => { e.preventDefault(); if (choice === null) return; const next = [...answers, { name: name.trim() || "Anonymous", option: choice }]; const nextComments = comment.trim() ? [...comments, comment.trim()] : comments; setAnswers(next); setComments(nextComments); if (sessionId) localStorage.setItem(getSessionKey(sessionId), JSON.stringify({ question, answers: next, comments: nextComments })); setSubmitted(true); };
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0"), ss = String(seconds % 60).padStart(2, "0");
  const options = question.options;
  return <main>
    <header><a className="brand" href="#" onClick={() => setTab("home")}>नेपाल <span>टुल्स</span></a><nav><button onClick={() => setTab("home")}>होम</button><button onClick={() => setTab("host")}>क्विज होस्ट</button><button onClick={() => setTab("join")}>QR बाट सहभागी</button></nav></header>
    {tab === "home" && <>
      <section className="hero"><div><p className="eyebrow">नेपालका लागि डिजिटल उपयोगिता</p><h1>कामका टुल, <em>साथै</em> सबैलाई जोड्ने ठाउँ।</h1><p className="sub">क्यालेन्डर, नेपाली टाइपिङ, कन्भर्टर र सामुदायिक क्विज—एकै ठाउँमा।</p><div className="hero-buttons"><button className="primary" onClick={() => setTab("host")}>क्विज सुरु गर्नुहोस्</button><button className="soft" onClick={() => setTab("join")}>QR स्क्यान गरेर सहभागी</button></div></div><aside className="calendar"><p>आजको मिति</p><strong>१३ भदौ २०८३, शुक्रबार</strong><span>August 28, 2026 · काठमाडौं</span><hr/><b>भाद्र शुक्ल पञ्चमी</b><small>सिद्धि · बव · स्वाती</small><div className="clock">१२:४३:४१ <i>PM</i></div></aside></section>
      <section className="tool-row"><article><b>नेपाली टाइपिङ</b><span>Romanized → Unicode</span></article><article><b>Preeti ↔ Unicode</b><span>द्रुत फन्ट रूपान्तरण</span></article><article><b>AD ↔ BS मिति</b><span>आजको पात्रो सहित</span></article><article><b>VAT क्याल्कुलेटर</b><span>१३% तुरुन्त हिसाब</span></article></section>
      <section className="section-title"><div><p className="eyebrow">नेपालका चर्चित विषय</p><h2>ताजा समाचार</h2></div><a href="https://news.google.com/search?q=Nepal" target="_blank">सबै समाचार हेर्नुहोस् ↗</a></section>
      <section className="news-grid">{(headlines.length ? headlines : seedNews.map(([source,title,url])=>({source,title,url}))).map((item,i)=><a className="news" key={`${item.source}-${i}`} href={item.url} target="_blank" rel="noreferrer"><span>{item.source}</span><h3>{item.title}</h3><p>{i % 2 === 0 ? "मूल प्रकाशकबाट प्रत्यक्ष पढ्नुहोस्" : "भरोसायोग्य स्रोतको नवीनतम अपडेट"}</p><b>पढ्नुहोस् →</b></a>)}</section>
      <section className="cta"><div><p className="eyebrow">कार्यक्रम, कक्षा वा बैठकका लागि</p><h2>प्रश्न सोध्नुहोस्। QR देखाउनुहोस्। सबैको उत्तर एकै ठाउँमा पाउनुहोस्।</h2></div><button className="primary" onClick={() => setTab("host")}>लाइभ क्विज बनाउनुहोस्</button></section>
    </>}
    {tab === "host" && <section className="workspace"><div className="workspace-head"><div><p className="eyebrow">लाइभ सहभागिता</p><h1>क्विज वा प्रश्न बनाउनुहोस्</h1><p>प्रश्न तयार गरेर QR देखाउनुहोस्। दर्शकले फोनबाट उत्तर वा विचार पठाउँछन्।</p></div><div className="timer"><span>समय</span><strong>{mm}:{ss}</strong><button onClick={() => setRunning(!running)}>{running ? "रोक्नुहोस्" : "चलाउनुहोस्"}</button></div></div><div className="host-grid"><form className="editor" onSubmit={e=>{e.preventDefault(); startSession();}}><label>प्रश्न<input value={question.text} onChange={e=>setQuestion({...question,text:e.target.value})}/></label>{options.map((opt,i)=><label key={i}>विकल्प {nepaliDigits(i+1)}<input value={opt} onChange={e=>{const next=[...options];next[i]=e.target.value;setQuestion({...question,options:next});}}/></label>)}<label>सही उत्तर<select value={question.correct} onChange={e=>setQuestion({...question,correct:Number(e.target.value)})}>{options.map((x,i)=><option value={i} key={i}>{nepaliDigits(i+1)}. {x}</option>)}</select></label><button className="primary" type="submit">QR सत्र सुरु गर्नुहोस्</button></form><aside className="session-card">{sessionId ? <><p className="session-live">● LIVE · {sessionId}</p><QRCodeSVG value={joinUrl} size={190} includeMargin/><h3>स्क्यान गरेर उत्तर दिनुहोस्</h3><code>{joinUrl}</code><div className="result"><b>{answers.length} उत्तर</b><span>{comments.length} टिप्पणी</span></div><div className="bars">{options.map((o,i)=><div key={o}><span>{o}</span><i style={{width:`${answers.length ? answers.filter(x=>x.option===i).length/answers.length*100 : 0}%`}} /></div>)}</div></> : <><div className="qr-placeholder">QR</div><h3>अहिले कुनै सत्र छैन</h3><p>बायाँतिर प्रश्न तयार गरेर सत्र सुरु गर्नुहोस्।</p></>}</aside></div>{comments.length>0&&<section className="comments"><h2>दर्शकका टिप्पणी</h2>{comments.map((c,i)=><p key={i}>“{c}”</p>)}</section>}</section>}
    {tab === "join" && <section className="join"><div className="join-card"><p className="eyebrow">QR सहभागिता</p><h1>{question.text}</h1>{!sessionId && <p className="notice">होस्टले दिएको QR स्क्यान गरेर यहाँ आउनुहोस्। यस डेमोमा एउटै उपकरणभित्र सत्र सुरक्षित हुन्छ। प्रकाशित संस्करणमा सबैको उत्तर लाइभ देखाउन सुरक्षित क्लाउड डाटाबेस जोडिनेछ।</p>}{submitted?<div className="thanks"><b>धन्यवाद!</b><p>तपाईंको उत्तर र टिप्पणी पठाइयो।</p></div>:<form onSubmit={submit}><label>तपाईंको नाम <small>(ऐच्छिक)</small><input value={name} onChange={e=>setName(e.target.value)} placeholder="नाम लेख्नुहोस्"/></label><fieldset><legend>सही उत्तर छान्नुहोस्</legend>{options.map((x,i)=><label className={choice===i?"picked":""} key={x}><input type="radio" name="answer" onChange={()=>setChoice(i)}/><span>{nepaliDigits(i+1)}</span>{x}</label>)}</fieldset><label>तपाईंको विचार वा टिप्पणी <small>(ऐच्छिक)</small><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="यहाँ लेख्नुहोस्…"/></label><button className="primary" type="submit">उत्तर पठाउनुहोस्</button></form>}</div></section>}
    <footer><b>नेपाल टुल्स</b><span>विश्वसनीय स्रोतमा आधारित उपयोगी डिजिटल टुलहरू</span><span>समाचार शीर्षकका लागि प्रकाशकको वेबसाइटमा जानुहोस्।</span></footer>
  </main>;
}
