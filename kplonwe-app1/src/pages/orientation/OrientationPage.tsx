import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  Compass, Briefcase, GraduationCap, Building2, TrendingUp,
  Sparkles, ChevronRight, MapPin, Clock, Banknote, RefreshCw, Brain, Target,
} from 'lucide-react';

/* ── Types ── */
interface Trait       { name: string; score: number; color: string; }
interface Career      { title: string; field: string; match: number; salary: string; description: string; reason: string; }
interface Field       { name: string; match: number; duration: string; description: string; }
interface School      { name: string; location: string; type: string; fields: string[]; match: number; }
interface Orientation {
  profileType: string; description: string; globalScore: number;
  traits: Trait[]; strengths: string[];
  careers: Career[]; fields: Field[]; schools: School[];
  generatedAt: string;
}

/* ── Scroll reveal ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, on };
}

/* ── Compteur animé ── */
function AnimNum({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [cur, setCur] = useState(0);
  const { ref, on } = useReveal();
  useEffect(() => {
    if (!on) return;
    let v = 0; const step = value / 50;
    const t = setInterval(() => { v += step; if (v >= value) { setCur(value); clearInterval(t); } else setCur(Math.floor(v)); }, 20);
    return () => clearInterval(t);
  }, [on, value]);
  return <span ref={ref}>{cur}{suffix}</span>;
}

/* ── SVG ring ── */
function MatchRing({ value, size = 60 }: { value: number; size?: number }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r;
  const { ref, on } = useReveal();
  const col = value >= 90 ? '#10b981' : value >= 80 ? '#f59e0b' : '#6366f1';
  return (
    <div ref={ref} style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={on ? circ*(1-value/100) : circ}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }}/>
      </svg>
      <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:'0.85rem',color:'white' }}>
        {value}%
      </div>
    </div>
  );
}

/* ── Trait bar ── */
function TraitBar({ trait, delay = 0 }: { trait: Trait; delay?: number }) {
  const { ref, on } = useReveal();
  return (
    <div ref={ref}>
      <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
        <span style={{ color:'#94a3b8',fontSize:'0.8rem',fontWeight:500 }}>{trait.name}</span>
        <span style={{ color:'white',fontSize:'0.8rem',fontWeight:700 }}>{trait.score}</span>
      </div>
      <div style={{ height:5,background:'rgba(255,255,255,0.07)',borderRadius:3,overflow:'hidden' }}>
        <div style={{ height:'100%',borderRadius:3,background:trait.color,
          width: on ? `${trait.score}%` : '0%',
          transition:`width 1s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
          boxShadow:`0 0 8px ${trait.color}88` }}/>
      </div>
    </div>
  );
}

/* ── Career card ── */
function CareerCard({ career, index }: { career: Career; index: number }) {
  const [open, setOpen] = useState(false);
  const { ref, on } = useReveal();
  return (
    <div ref={ref} onClick={() => setOpen(o => !o)}
      style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:22,cursor:'pointer',
        opacity:on?1:0, transform:on?'none':'translateY(20px)',
        transition:`opacity .6s ease ${index*90}ms, transform .6s ease ${index*90}ms, border-color .2s, background .2s` }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='rgba(245,158,11,0.3)'; el.style.background='rgba(255,255,255,0.06)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='rgba(255,255,255,0.08)'; el.style.background='rgba(255,255,255,0.04)'; }}
    >
      <div style={{ display:'flex',alignItems:'flex-start',gap:14 }}>
        <MatchRing value={career.match}/>
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
            <h3 style={{ fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:700,fontSize:'0.95rem',color:'white',margin:0 }}>{career.title}</h3>
            <ChevronRight size={15} color="#64748b" style={{ transform:open?'rotate(90deg)':'none',transition:'transform .2s',flexShrink:0 }}/>
          </div>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:5 }}>
            <span style={{ background:'rgba(245,158,11,0.12)',color:'#f59e0b',fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:100 }}>{career.field}</span>
            <span style={{ color:'#475569',fontSize:11,display:'flex',alignItems:'center',gap:3 }}><Banknote size={11}/>{career.salary}</span>
          </div>
          <p style={{ color:'#64748b',fontSize:'0.82rem',lineHeight:1.6,margin:0 }}>{career.description}</p>
        </div>
      </div>
      {open && (
        <div style={{ marginTop:12,padding:'11px 13px',borderRadius:10,background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)' }}>
          <div style={{ display:'flex',gap:7 }}>
            <Brain size={13} color="#f59e0b" style={{ flexShrink:0,marginTop:2 }}/>
            <p style={{ color:'#cbd5e1',fontSize:'0.82rem',lineHeight:1.7,margin:0 }}>{career.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Field card ── */
function FieldCard({ field, index }: { field: Field; index: number }) {
  const { ref, on } = useReveal();
  return (
    <div ref={ref} style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:13,padding:18,display:'flex',justifyContent:'space-between',gap:12,
      opacity:on?1:0,transform:on?'none':'translateX(-14px)',
      transition:`opacity .5s ease ${index*80}ms, transform .5s ease ${index*80}ms` }}>
      <div style={{ flex:1 }}>
        <h4 style={{ fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:700,color:'white',fontSize:'0.88rem',margin:'0 0 4px' }}>{field.name}</h4>
        <div style={{ display:'flex',gap:5,alignItems:'center',marginBottom:4 }}>
          <Clock size={10} color="#64748b"/><span style={{ color:'#64748b',fontSize:10 }}>{field.duration}</span>
        </div>
        <p style={{ color:'#64748b',fontSize:'0.78rem',margin:0,lineHeight:1.5 }}>{field.description}</p>
      </div>
      <div style={{ background:'rgba(99,102,241,0.12)',color:'#818cf8',fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:'0.9rem',padding:'5px 10px',borderRadius:9,flexShrink:0,border:'1px solid rgba(99,102,241,0.2)',alignSelf:'flex-start' }}>{field.match}%</div>
    </div>
  );
}

/* ── School card ── */
function SchoolCard({ school, index }: { school: School; index: number }) {
  const { ref, on } = useReveal();
  return (
    <div ref={ref} style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:20,display:'flex',flexDirection:'column',gap:12,
      opacity:on?1:0,transform:on?'none':'translateY(18px)',
      transition:`opacity .6s ease ${index*80}ms, transform .6s ease ${index*80}ms` }}>
      <div style={{ display:'flex',justifyContent:'space-between',gap:10 }}>
        <div>
          <h3 style={{ fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:700,fontSize:'0.88rem',color:'white',margin:'0 0 5px' }}>{school.name}</h3>
          <div style={{ display:'flex',gap:7,flexWrap:'wrap' }}>
            <span style={{ color:'#94a3b8',fontSize:10,display:'flex',alignItems:'center',gap:3 }}><MapPin size={9}/>{school.location}</span>
            <span style={{ color:'#475569',fontSize:10 }}>· {school.type}</span>
          </div>
        </div>
        <div style={{ background:school.match>=90?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)',color:school.match>=90?'#10b981':'#f59e0b',fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:'0.9rem',padding:'4px 10px',borderRadius:9,flexShrink:0 }}>{school.match}%</div>
      </div>
      <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
        {school.fields.map(f => <span key={f} style={{ background:'rgba(99,102,241,0.1)',color:'#a5b4fc',fontSize:10,fontWeight:500,padding:'2px 8px',borderRadius:100,border:'1px solid rgba(99,102,241,0.2)' }}>{f}</span>)}
      </div>
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ icon, label, title }: { icon: React.ReactNode; label: string; title: string }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:'flex',alignItems:'center',gap:7,marginBottom:8 }}>
        <span style={{ color:'#f59e0b' }}>{icon}</span>
        <span style={{ color:'#f59e0b',fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase' }}>{label}</span>
      </div>
      <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:800,fontSize:'clamp(1.3rem,3vw,1.8rem)',color:'white',margin:0,letterSpacing:'-0.02em' }}>{title}</h2>
    </div>
  );
}

/* ── PAGE ── */
export function OrientationPage() {
  const { user } = useAuth();
  const { studentId: paramId } = useParams<{ studentId?: string }>();
  const [data, setData]       = useState<Orientation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const studentId = paramId || user?.id || '';

  const load = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true); setError('');
      const res = await api.get(`/orientation/${studentId}`);
      if (res.data.success) setData(res.data);
      else throw new Error(res.data.message);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ minHeight:'70vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Outfit:wght@700;800&display=swap');@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44,height:44,borderRadius:'50%',border:'3px solid rgba(245,158,11,0.15)',borderTop:'3px solid #f59e0b',animation:'spin 1s linear infinite',margin:'0 auto 14px' }}/>
        <p style={{ color:'#64748b',fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:'0.85rem' }}>Analyse du profil en cours…</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight:'70vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Outfit:wght@700;800&display=swap');`}</style>
      <div style={{ textAlign:'center',maxWidth:360 }}>
        <div style={{ width:50,height:50,borderRadius:14,background:'rgba(239,68,68,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}><Compass size={24} color="#ef4444"/></div>
        <h2 style={{ fontFamily:'Plus Jakarta Sans,sans-serif',color:'white',fontWeight:700,marginBottom:10 }}>Profil indisponible</h2>
        <p style={{ color:'#64748b',marginBottom:20,lineHeight:1.65 }}>{error || 'Les recommandations ne sont pas disponibles.'}</p>
        <button onClick={load} style={{ background:'#f59e0b',color:'#000',fontWeight:700,padding:'10px 20px',borderRadius:10,border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:7,fontFamily:'Plus Jakarta Sans,sans-serif' }}>
          <RefreshCw size={14}/> Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .or-root { background:#0a0f1e; min-height:100vh; }
        .or-grid-2 { display:grid; gap:12px; }
        .or-schools { display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); }
        @media(min-width:1024px){ .or-grid-2 { grid-template-columns:1fr 1fr; } }
      `}</style>
      <div className="or-root">

        {/* ── HERO ── */}
        <div style={{ position:'relative',overflow:'hidden',padding:'60px 0 44px' }}>
          <div style={{ position:'absolute',top:-60,left:'50%',transform:'translateX(-50%)',width:480,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 70%)',pointerEvents:'none' }}/>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(245,158,11,0.2),transparent)' }}/>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:44,alignItems:'center' }}>

              {/* Gauche */}
              <div style={{ animation:'fadeUp .7s ease forwards' }}>
                <div style={{ display:'inline-flex',alignItems:'center',gap:7,background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',padding:'4px 12px',borderRadius:100,marginBottom:20 }}>
                  <Sparkles size={11} color="#f59e0b"/>
                  <span style={{ color:'#f59e0b',fontSize:10,fontWeight:700,letterSpacing:'0.1em',fontFamily:'Outfit,sans-serif' }}>ANALYSE DE PROFIL</span>
                </div>
                <h1 style={{ fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:800,fontSize:'clamp(1.9rem,5vw,3rem)',lineHeight:1.1,letterSpacing:'-0.03em',margin:'0 0 16px',color:'white' }}>
                  Ton avenir<br/>
                  <span style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>commence ici.</span>
                </h1>
                <p style={{ color:'#94a3b8',fontSize:'0.95rem',lineHeight:1.75,maxWidth:420,margin:'0 0 26px',fontFamily:'Plus Jakarta Sans,sans-serif' }}>
                  Voici les métiers, filières et écoles qui correspondent à ton profil. Bientôt enrichi par l'IA.
                </p>
                <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                  <div style={{ width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Outfit,sans-serif',fontWeight:800,fontSize:'1rem',color:'white',flexShrink:0 }}>
                    {(user?.firstName?.[0] || 'E').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:700,color:'white',fontSize:'0.88rem' }}>{user?.firstName} {user?.lastName}</div>
                    <div style={{ color:'#475569',fontSize:10,marginTop:2 }}>Analysé le {new Date(data.generatedAt).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div>
                  </div>
                </div>
              </div>

              {/* Droite — carte profil */}
              <div style={{ animation:'fadeUp .7s ease .15s both' }}>
                <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.08) 0%,rgba(239,68,68,0.05) 100%)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:20,padding:26 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
                    <div>
                      <div style={{ color:'#64748b',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'Outfit,sans-serif',marginBottom:4 }}>Type de profil</div>
                      <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:800,fontSize:'1.05rem',color:'white' }}>{data.profileType}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:'#64748b',fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:'Outfit,sans-serif',marginBottom:2 }}>Score global</div>
                      <div style={{ fontFamily:'Outfit,sans-serif',fontWeight:900,fontSize:'2.4rem',lineHeight:1,background:'linear-gradient(135deg,#f59e0b,#ef4444)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
                        <AnimNum value={data.globalScore} suffix="/100"/>
                      </div>
                    </div>
                  </div>
                  <p style={{ color:'#94a3b8',fontSize:'0.83rem',lineHeight:1.7,marginBottom:18,fontFamily:'Plus Jakarta Sans,sans-serif' }}>{data.description}</p>
                  <div style={{ marginBottom:20 }}>
                    <div style={{ color:'#64748b',fontSize:10,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',fontFamily:'Outfit,sans-serif',marginBottom:8 }}>Points forts</div>
                    <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                      {data.strengths.map(s => <span key={s} style={{ background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',color:'#34d399',padding:'2px 9px',borderRadius:100,fontSize:11,fontWeight:600 }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',gap:11 }}>
                    {data.traits.map((t,i) => <TraitBar key={t.name} trait={t} delay={i*60}/>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height:1,background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)',margin:'0 0 60px' }}/>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingBottom:80 }}>

          {/* CAREERS */}
          <section style={{ marginBottom:64 }}>
            <SectionHeader icon={<Briefcase size={16}/>} label="Métiers recommandés" title="Les carrières qui te correspondent"/>
            <div className="or-grid-2">{data.careers.map((c,i) => <CareerCard key={c.title} career={c} index={i}/>)}</div>
            <p style={{ color:'#475569',fontSize:11,marginTop:10,display:'flex',alignItems:'center',gap:5 }}><Brain size={12} color="#475569"/>Cliquez sur une carte pour voir pourquoi cette carrière vous correspond</p>
          </section>

          <div style={{ height:1,background:'rgba(255,255,255,0.05)',marginBottom:64 }}/>

          {/* FIELDS */}
          <section style={{ marginBottom:64 }}>
            <SectionHeader icon={<GraduationCap size={16}/>} label="Filières adaptées" title="Les formations qui t'ouvriront des portes"/>
            <div className="or-grid-2">{data.fields.map((f,i) => <FieldCard key={f.name} field={f} index={i}/>)}</div>
          </section>

          <div style={{ height:1,background:'rgba(255,255,255,0.05)',marginBottom:64 }}/>

          {/* SCHOOLS */}
          <section style={{ marginBottom:64 }}>
            <SectionHeader icon={<Building2 size={16}/>} label="Établissements compatibles" title="Les écoles faites pour ton profil"/>
            <div className="or-schools">{data.schools.map((s,i) => <SchoolCard key={s.name} school={s} index={i}/>)}</div>
          </section>

          {/* EXPLAINER */}
          <section>
            <div style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.07) 0%,rgba(245,158,11,0.05) 100%)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:32 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:18 }}>
                <Target size={16} color="#6366f1"/>
                <span style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,color:'#a5b4fc',fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase' }}>Pourquoi ces recommandations ?</span>
              </div>
              <h3 style={{ fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:800,color:'white',fontSize:'1.1rem',margin:'0 0 18px' }}>Ces suggestions sont basées sur :</h3>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))',gap:10,marginBottom:20 }}>
                {[
                  { icon:<TrendingUp size={15} color="#10b981"/>, bg:'rgba(16,185,129,0.1)',  bd:'rgba(16,185,129,0.2)',  title:'Performances académiques', desc:'Résultats et progression scolaire' },
                  { icon:<Brain size={15} color="#f59e0b"/>,      bg:'rgba(245,158,11,0.1)', bd:'rgba(245,158,11,0.2)', title:'Profil de personnalité',    desc:'Traits cognitifs et comportementaux' },
                  { icon:<Sparkles size={15} color="#8b5cf6"/>,   bg:'rgba(139,92,246,0.1)', bd:'rgba(139,92,246,0.2)', title:'Matières dominantes',       desc:'Disciplines où tu excelles' },
                  { icon:<Compass size={15} color="#3b82f6"/>,    bg:'rgba(59,130,246,0.1)', bd:'rgba(59,130,246,0.2)', title:'Tendances du marché',       desc:'Métiers porteurs au Bénin et en Afrique' },
                ].map(({ icon, bg, bd, title, desc }) => (
                  <div key={title} style={{ background:bg,border:`1px solid ${bd}`,borderRadius:10,padding:14 }}>
                    <div style={{ marginBottom:7 }}>{icon}</div>
                    <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:700,color:'white',fontSize:'0.82rem',marginBottom:4 }}>{title}</div>
                    <p style={{ color:'#64748b',fontSize:'0.76rem',lineHeight:1.55,margin:0 }}>{desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ padding:'12px 15px',background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.15)',borderRadius:9,display:'flex',gap:9 }}>
                <Sparkles size={13} color="#f59e0b" style={{ flexShrink:0,marginTop:2 }}/>
                <p style={{ color:'#94a3b8',fontSize:'0.8rem',lineHeight:1.7,margin:0 }}>
                  <strong style={{ color:'#f59e0b' }}>Bientôt disponible</strong> — Notre IA analysera vos quiz et résultats scolaires pour des recommandations encore plus précises.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
