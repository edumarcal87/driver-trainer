import React, { useState, useEffect } from 'react';

const FEATURES = [
  { icon: '🎯', title: '50+ Exercícios', desc: 'Frenagem, aceleração, volante, embreagem e câmbio — do básico ao avançado.' },
  { icon: '🏁', title: '4 Circuitos Reais', desc: 'Interlagos, Spa, Monza e Silverstone com cenários baseados em telemetria.' },
  { icon: '🏎️', title: 'Perfis de Carro', desc: 'GT3, Fórmula e Turismo — a mesma curva se adapta ao seu carro.' },
  { icon: '📊', title: 'Análise Detalhada', desc: 'Score por segmento, tendências, comparação e coaching em tempo real.' },
  { icon: '🎮', title: 'Multi-Volante', desc: 'Logitech, Thrustmaster, Fanatec, MOZA e Simagic — detecção automática.' },
  { icon: '📤', title: 'Compartilhe', desc: 'Gere cards visuais do seu resultado e compartilhe com a comunidade.' },
];

const TRACKS = [
  { flag: '🇧🇷', name: 'Interlagos', corners: 14, desc: 'Senna S, Mergulho, Junção' },
  { flag: '🇧🇪', name: 'Spa-Francorchamps', corners: 7, desc: 'Eau Rouge, Blanchimont, Bus Stop' },
  { flag: '🇮🇹', name: 'Monza', corners: 7, desc: 'Rettifilo, Lesmos, Parabolica' },
  { flag: '🇬🇧', name: 'Silverstone', corners: 6, desc: 'Maggotts-Becketts, Copse, Stowe' },
];

const PLANS = [
  {
    name: 'Gratuito', price: 'R$ 0', period: '', color: '#2980b9', highlight: false,
    features: ['Treino livre completo', '50+ exercícios', 'Todos os inputs (pedais, volante, câmbio)', 'Perfis de carro', 'Análise de performance', 'Suporte multi-volante'],
    cta: 'COMEÇAR GRÁTIS',
  },
  {
    name: 'Premium', price: 'R$ 19,90', period: '/mês', color: '#f1c40f', highlight: true,
    features: ['Tudo do plano Gratuito', '11 programas de treino guiados', '4 circuitos reais (34 cenários)', 'Meia volta e volta completa', 'Sync na nuvem', 'Novos circuitos assim que lançarem'],
    cta: 'ASSINAR PREMIUM',
  },
];

const TESTIMONIALS = [
  { name: 'Lucas R.', car: 'GT3 — iRacing', text: 'Meu trail braking melhorou absurdamente. Em 2 semanas já senti diferença no tempo de volta.' },
  { name: 'Felipe M.', car: 'F4 — ACC', text: 'O cenário de Interlagos é bizarro de bom. Treino cada curva antes de entrar na corrida.' },
  { name: 'André S.', car: 'Porsche Cup — rFactor', text: 'Nunca tinha treinado câmbio H-pattern assim. O heel-toe ficou muito mais natural.' },
];

export default function LandingPage({ onEnterApp }) {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) setVisibleSections(prev => ({ ...prev, [e.target.id]: true }));
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id) => visibleSections[id];

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif", color: '#1a1a1a', background: '#f0efe8', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ── Navigation ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '12px 0',
        background: scrollY > 50 ? 'rgba(240,239,232,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid #e0dfd8' : 'none',
        transition: 'all .3s',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, border: '2px solid #e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/><circle cx="8" cy="44" r="3.5" fill="#e74c3c"/><circle cx="30" cy="22" r="3" fill="#27ae60"/><circle cx="44" cy="14" r="2.5" fill="#f39c12"/></svg>
            </div>
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", letterSpacing: '-0.3px' }}>
                DRIVER <span style={{ color: '#e74c3c', fontWeight: 300 }}>TRAINER</span>
              </span>
            </div>
          </div>
          <div className="landing-nav-links">
            <a href="#features" style={{ fontSize: 12, color: '#5a5a5a', textDecoration: 'none', padding: '6px 12px', fontWeight: 500 }}>Recursos</a>
            <a href="#tracks" style={{ fontSize: 12, color: '#5a5a5a', textDecoration: 'none', padding: '6px 12px', fontWeight: 500 }}>Circuitos</a>
            <a href="#pricing" style={{ fontSize: 12, color: '#5a5a5a', textDecoration: 'none', padding: '6px 12px', fontWeight: 500 }}>Planos</a>
            <button onClick={onEnterApp} style={{
              padding: '8px 20px', fontSize: 12, borderRadius: 20, fontWeight: 700,
              fontFamily: "'Oxanium', sans-serif", letterSpacing: '.3px',
              border: '2px solid #e74c3c', background: '#e74c3c', color: '#fff',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(231,76,60,0.2)',
            }}>
              ACESSAR APP →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '120px 24px 80px',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04 }}>
          <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="none">
            <path d="M0 300 Q200 100 400 300 Q600 500 800 300" fill="none" stroke="#e74c3c" strokeWidth="60"/>
            <path d="M0 350 Q200 150 400 350 Q600 550 800 350" fill="none" stroke="#27ae60" strokeWidth="40"/>
            <path d="M0 400 Q200 200 400 400 Q600 600 800 400" fill="none" stroke="#f39c12" strokeWidth="20"/>
          </svg>
        </div>

        <div style={{ maxWidth: 800, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', padding: '6px 18px', borderRadius: 20,
            background: '#e74c3c10', border: '1px solid #e74c3c20', marginBottom: 24,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#e74c3c', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '1px' }}>
              🏎️ TREINAMENTO DE SIM RACING
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700,
            fontFamily: "'Oxanium', sans-serif", lineHeight: 1.1, letterSpacing: '-1px',
            marginBottom: 20,
          }}>
            Do pedal ao pódio.<br />
            <span style={{ color: '#e74c3c' }}>Treine como profissional.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 18px)', color: '#5a5a5a', maxWidth: 560, margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            Exercícios de frenagem, aceleração, volante e câmbio com feedback em tempo real.
            Cenários de pistas reais. Suporte a todos os principais volantes do mercado.
          </p>

          <div className="landing-hero-btns">
            <button onClick={onEnterApp} style={{
              padding: '14px 36px', fontSize: 15, borderRadius: 12, fontWeight: 700,
              fontFamily: "'Oxanium', sans-serif", letterSpacing: '.5px',
              border: '2px solid #e74c3c', background: '#e74c3c', color: '#fff',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(231,76,60,0.3)',
              transition: 'transform .15s, box-shadow .15s',
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 24px rgba(231,76,60,0.35)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 16px rgba(231,76,60,0.3)'; }}
            >
              COMEÇAR A TREINAR
            </button>
            <a href="#features" style={{
              padding: '14px 36px', fontSize: 15, borderRadius: 12, fontWeight: 600,
              fontFamily: "'Oxanium', sans-serif",
              border: '2px solid #e0dfd8', background: '#fff', color: '#5a5a5a',
              cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
            }}>
              SAIBA MAIS ↓
            </a>
          </div>

          {/* Stats bar */}
          <div className="landing-stats" style={{ marginTop: 48 }}>
            {[
              { num: '50+', label: 'Exercícios' },
              { num: '34', label: 'Cenários de pista' },
              { num: '4', label: 'Circuitos reais' },
              { num: '10+', label: 'Volantes suportados' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", color: '#1a1a1a' }}>{s.num}</span>
                <p style={{ fontSize: 11, color: '#9a9a90', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '.5px', marginTop: 2 }}>{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" data-animate style={{
        padding: '80px 24px', maxWidth: 1100, margin: '0 auto',
        opacity: isVisible('features') ? 1 : 0, transform: isVisible('features') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .6s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#e74c3c', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '2px' }}>RECURSOS</span>
          <h2 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", marginTop: 8 }}>
            Tudo que você precisa para evoluir
          </h2>
        </div>
        <div className="landing-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding: '24px', background: '#fff', borderRadius: 16, border: '1.5px solid #e0dfd8',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
            >
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", marginTop: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#5a5a5a', marginTop: 6, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tracks ── */}
      <section id="tracks" data-animate style={{
        padding: '80px 24px', background: '#fff',
        opacity: isVisible('tracks') ? 1 : 0, transform: isVisible('tracks') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .6s cubic-bezier(.4,0,.2,1) .1s',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#27ae60', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '2px' }}>CENÁRIOS REAIS</span>
            <h2 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", marginTop: 8 }}>
              Pistas lendárias do automobilismo
            </h2>
            <p style={{ fontSize: 14, color: '#5a5a5a', marginTop: 8, maxWidth: 500, margin: '8px auto 0' }}>
              Cada curva baseada em telemetria real. Treine o S do Senna, Eau Rouge e Maggotts-Becketts.
            </p>
          </div>
          <div className="landing-tracks-grid">
            {TRACKS.map((t, i) => (
              <div key={i} style={{
                padding: '28px 24px', background: '#f0efe8', borderRadius: 16, border: '1.5px solid #e0dfd8',
                textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>{t.flag}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Oxanium', sans-serif" }}>{t.name}</h3>
                <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", color: '#e74c3c', margin: '8px 0 4px' }}>{t.corners} cenários</p>
                <p style={{ fontSize: 12, color: '#9a9a90' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section data-animate id="howitworks" style={{
        padding: '80px 24px', maxWidth: 1100, margin: '0 auto',
        opacity: isVisible('howitworks') ? 1 : 0, transform: isVisible('howitworks') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .6s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#f39c12', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '2px' }}>COMO FUNCIONA</span>
          <h2 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", marginTop: 8 }}>
            3 passos para evoluir
          </h2>
        </div>
        <div className="landing-steps-grid">
          {[
            { step: '01', title: 'Conecte seu volante', desc: 'Plug and play. O app detecta automaticamente G29, T300, Fanatec e outros. Ou use o teclado para começar.', color: '#e74c3c' },
            { step: '02', title: 'Escolha o exercício', desc: 'Treino livre, programas guiados ou cenários de pistas reais. Filtre por tipo de input e perfil de carro.', color: '#27ae60' },
            { step: '03', title: 'Siga a curva-alvo', desc: 'Acompanhe a curva no gráfico em tempo real. Receba feedback instantâneo, score detalhado e dicas de melhoria.', color: '#2980b9' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                background: s.color + '12', border: `2px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", color: s.color,
              }}>{s.step}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Oxanium', sans-serif" }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: '#5a5a5a', marginTop: 8, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section data-animate id="testimonials" style={{
        padding: '80px 24px', background: '#fff',
        opacity: isVisible('testimonials') ? 1 : 0, transform: isVisible('testimonials') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .6s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#8e44ad', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '2px' }}>PILOTOS</span>
            <h2 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", marginTop: 8 }}>
              O que dizem os pilotos
            </h2>
          </div>
          <div className="landing-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ padding: '24px', background: '#f0efe8', borderRadius: 16, border: '1.5px solid #e0dfd8' }}>
                <p style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 16 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e74c3c15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#e74c3c' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</p>
                    <p style={{ fontSize: 10, color: '#9a9a90' }}>{t.car}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" data-animate style={{
        padding: '80px 24px', maxWidth: 900, margin: '0 auto',
        opacity: isVisible('pricing') ? 1 : 0, transform: isVisible('pricing') ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .6s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#f1c40f', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '2px' }}>PLANOS</span>
          <h2 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", marginTop: 8 }}>
            Escolha seu plano
          </h2>
        </div>
        <div className="landing-pricing-grid">
          {PLANS.map((p, i) => (
            <div key={i} style={{
              padding: '32px 28px', background: '#fff', borderRadius: 20,
              border: p.highlight ? '2px solid #f1c40f' : '1.5px solid #e0dfd8',
              boxShadow: p.highlight ? '0 8px 32px rgba(241,196,15,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
              position: 'relative',
            }}>
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 16px', borderRadius: 20, background: '#f1c40f', color: '#1a1a1a',
                  fontSize: 10, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", letterSpacing: '.5px',
                }}>⭐ MAIS POPULAR</div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", color: p.color }}>{p.name}</h3>
              <div style={{ marginTop: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Oxanium', sans-serif" }}>{p.price}</span>
                <span style={{ fontSize: 14, color: '#9a9a90' }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {p.features.map((f, fi) => (
                  <li key={fi} style={{ fontSize: 13, color: '#5a5a5a', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: '#27ae60', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onEnterApp} style={{
                width: '100%', padding: '12px', fontSize: 14, borderRadius: 12, fontWeight: 700,
                fontFamily: "'Oxanium', sans-serif", letterSpacing: '.3px',
                border: p.highlight ? '2px solid #f1c40f' : '2px solid #e0dfd8',
                background: p.highlight ? '#f1c40f' : '#fff',
                color: p.highlight ? '#1a1a1a' : '#5a5a5a',
                cursor: 'pointer', transition: 'transform .15s',
              }}
                onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'linear-gradient(135deg, #e74c3c08, #27ae6008)',
      }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Oxanium', sans-serif", marginBottom: 12 }}>
          Pronto para treinar?
        </h2>
        <p style={{ fontSize: 15, color: '#5a5a5a', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
          Comece gratuitamente. Sem cartão de crédito. Evolua no seu ritmo.
        </p>
        <button onClick={onEnterApp} style={{
          padding: '16px 48px', fontSize: 16, borderRadius: 14, fontWeight: 700,
          fontFamily: "'Oxanium', sans-serif", letterSpacing: '.5px',
          border: 'none', background: '#e74c3c', color: '#fff',
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(231,76,60,0.3)',
        }}>
          ACESSAR O DRIVER TRAINER →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid #e0dfd8', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid #e74c3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Oxanium', sans-serif" }}>DRIVER <span style={{ color: '#e74c3c', fontWeight: 300 }}>TRAINER</span></span>
        </div>
        <p style={{ fontSize: 11, color: '#9a9a90' }}>© 2025 Driver Trainer. Do pedal ao pódio.</p>
      </footer>
    </div>
  );
}
