/**
 * Autodromo Nazionale Monza — 5.793 km, Italy.
 * The Temple of Speed — long straights, heavy braking zones, low downforce.
 * Steering: 0.5 = center, 0 = full left, 1 = full right
 */

export const MONZA_EXERCISES = [
  // ── Variante del Rettifilo (T1-T2) — chicane de frenagem pesada ──
  {
    id: 'mza_t1_rettifilo', name: 'Rettifilo — Chicane 1', icon: '🔴',
    desc: 'A frenagem mais pesada do calendário. De 350 km/h para 70 km/h. Chicane direita-esquerda.',
    pedal: 'combined', track: 'monza', corner: 'T1',
    curves: {
      brake: t => { if(t<.03)return t/.03; if(t<.18)return 1; if(t<.45)return 1-(t-.18)/.27; return 0; },
      steering: t => {
        if(t<.1)return .5; if(t<.22)return .5+((t-.1)/.12)*.25; if(t<.35)return .75;
        if(t<.48)return .75-((t-.35)/.13)*.5; if(t<.62)return .25;
        if(t<.78)return .25+((t-.62)/.16)*.25; return .5;
      },
      throttle: t => { if(t<.4)return 0; if(t<.55)return(t-.4)/.15*.4; if(t<.65)return .4-((t-.55)/.1)*.2; if(t<.8)return .2+((t-.65)/.15)*.8; return 1; },
    },
    duration: 6000, diff: 3,
  },

  // ── Curva Grande (T3-T4) — curva de direita em alta velocidade ──
  {
    id: 'mza_t3_curva_grande', name: 'Curva Grande', icon: '🏎️',
    desc: 'Curva longa de direita em alta velocidade. Gás parcial com comprometimento.',
    pedal: 'combined', track: 'monza', corner: 'T3',
    curves: {
      steering: t => { if(t<.1)return .5; if(t<.3)return .5+((t-.1)/.2)*.2; if(t<.7)return .7; if(t<.9)return .7-((t-.7)/.2)*.2; return .5; },
      throttle: t => { if(t<.05)return 1; if(t<.15)return 1-((t-.05)/.1)*.3; if(t<.5)return .7; if(t<.75)return .7+((t-.5)/.25)*.3; return 1; },
    },
    duration: 4500, diff: 2,
  },

  // ── Variante della Roggia (T5-T6) — segunda chicane ──
  {
    id: 'mza_t5_roggia', name: 'Roggia — Chicane 2', icon: '🔀',
    desc: 'Segunda chicane de Monza. Frenagem forte, esquerda-direita rápida.',
    pedal: 'combined', track: 'monza', corner: 'T5',
    curves: {
      brake: t => { if(t<.04)return t/.04; if(t<.15)return 1; if(t<.38)return 1-(t-.15)/.23; return 0; },
      steering: t => {
        if(t<.08)return .5; if(t<.2)return .5-((t-.08)/.12)*.3; if(t<.32)return .2;
        if(t<.45)return .2+((t-.32)/.13)*.55; if(t<.6)return .75;
        if(t<.75)return .75-((t-.6)/.15)*.25; return .5;
      },
      throttle: t => { if(t<.32)return 0; if(t<.45)return(t-.32)/.13*.3; if(t<.55)return .3-((t-.45)/.1)*.15; if(t<.7)return .15+((t-.55)/.15)*.85; return 1; },
    },
    duration: 5500, diff: 3,
  },

  // ── Lesmo 1 (T7) — curva de direita em descida ──
  {
    id: 'mza_t7_lesmo1', name: 'Lesmo 1', icon: '⬇️',
    desc: 'Curva de direita em descida. Trail braking cuidadoso — menos grip na descida.',
    pedal: 'combined', track: 'monza', corner: 'T7',
    curves: {
      brake: t => { if(t<.05)return t/.05*.85; if(t<.18)return .85; if(t<.45)return .85-(t-.18)/.27*.85; return 0; },
      steering: t => { if(t<.12)return .5; if(t<.3)return .5+((t-.12)/.18)*.3; if(t<.6)return .8; if(t<.85)return .8-((t-.6)/.25)*.3; return .5; },
      throttle: t => { if(t<.4)return 0; if(t<.7)return Math.pow((t-.4)/.3,1.1); return 1; },
    },
    duration: 5000, diff: 3,
  },

  // ── Lesmo 2 (T8) — curva de direita mais apertada ──
  {
    id: 'mza_t8_lesmo2', name: 'Lesmo 2', icon: '🔄',
    desc: 'Mais lenta que a Lesmo 1. Frenagem e esterço maior, saída crucial para reta de trás.',
    pedal: 'combined', track: 'monza', corner: 'T8',
    curves: {
      brake: t => { if(t<.05)return t/.05*.9; if(t<.2)return .9; if(t<.5)return .9-(t-.2)/.3*.9; return 0; },
      steering: t => { if(t<.1)return .5; if(t<.28)return .5+((t-.1)/.18)*.35; if(t<.6)return .85; if(t<.85)return .85-((t-.6)/.25)*.35; return .5; },
      throttle: t => { if(t<.45)return 0; if(t<.75)return Math.pow((t-.45)/.3,1.0)*.7; if(t<.9)return .7+((t-.75)/.15)*.3; return 1; },
    },
    duration: 5500, diff: 3,
  },

  // ── Ascari (T9-T10-T11) — chicane em S ──
  {
    id: 'mza_t9_ascari', name: 'Ascari — Variante S', icon: '🐍',
    desc: 'Chicane em S: esquerda-direita-esquerda. Ritmo e fluidez.',
    pedal: 'combined', track: 'monza', corner: 'T9',
    curves: {
      brake: t => { if(t<.04)return t/.04*.7; if(t<.12)return .7; if(t<.25)return .7-(t-.12)/.13*.7; return 0; },
      steering: t => {
        if(t<.08)return .5; if(t<.2)return .5-((t-.08)/.12)*.25; if(t<.32)return .25;
        if(t<.45)return .25+((t-.32)/.13)*.5; if(t<.58)return .75;
        if(t<.72)return .75-((t-.58)/.14)*.4; if(t<.85)return .35+((t-.72)/.13)*.15; return .5;
      },
      throttle: t => { if(t<.2)return 0; if(t<.35)return(t-.2)/.15*.5; if(t<.45)return .5-((t-.35)/.1)*.3; if(t<.6)return .2+((t-.45)/.15)*.4; if(t<.75)return .6+((t-.6)/.15)*.4; return 1; },
    },
    duration: 6000, diff: 3,
  },

  // ── Parabolica / Alboreto (T11) — última curva ──
  {
    id: 'mza_t11_parabolica', name: 'Parabolica (Alboreto)', icon: '🏁',
    desc: 'A curva mais importante de Monza. Saída perfeita = velocidade máxima na reta.',
    pedal: 'combined', track: 'monza', corner: 'T11',
    curves: {
      brake: t => { if(t<.05)return t/.05*.8; if(t<.12)return .8; if(t<.3)return .8-(t-.12)/.18*.8; return 0; },
      steering: t => { if(t<.08)return .5; if(t<.25)return .5+((t-.08)/.17)*.3; if(t<.6)return .8; if(t<.85)return .8-((t-.6)/.25)*.3; return .5; },
      throttle: t => { if(t<.25)return 0; if(t<.5)return Math.pow((t-.25)/.25,.9)*.5; if(t<.75)return .5+((t-.5)/.25)*.3; if(t<.9)return .8+((t-.75)/.15)*.2; return 1; },
    },
    duration: 6000, diff: 3,
  },
];

export const MONZA_TUTORIALS = {
  mza_t1_rettifilo: { title: 'Rettifilo — Chicane 1', paragraphs: ['A frenagem mais brutal do calendário. De 350 para 70 km/h em ~100 metros.','Trail braking na chicane, gás entre as curvas.'], diagram: 'full_corner', tips: ['Freio a fundo — zona longa','Chicane: direita→esquerda','Gás progressivo entre os lados'] },
  mza_t3_curva_grande: { title: 'Curva Grande', paragraphs: ['Curva de alta velocidade sem freio. Comprometimento e gás parcial.'], diagram: 'feathering', tips: ['Sem freio — apenas lift','Gás parcial ~70% no apex','Comprometimento é tudo'] },
  mza_t5_roggia: { title: 'Roggia — Chicane 2', paragraphs: ['Frenagem pesada para chicane esquerda-direita. Boa saída para a Lesmo.'], diagram: 'full_corner', tips: ['Frenagem forte','Esquerda→direita rápida','Saída define a Lesmo 1'] },
  mza_t7_lesmo1: { title: 'Lesmo 1', paragraphs: ['Curva de direita em descida. Menos grip disponível.'], diagram: 'trail', tips: ['Cuidado na descida','Trail braking suave','Aceleração progressiva'] },
  mza_t8_lesmo2: { title: 'Lesmo 2', paragraphs: ['Mais apertada que a 1. Saída crucial para velocidade na reta de trás.'], diagram: 'full_corner', tips: ['Frenagem mais forte que Lesmo 1','Esterço maior','Saída paciente — pense na reta'] },
  mza_t9_ascari: { title: 'Ascari', paragraphs: ['Chicane em S — ritmo e fluidez definem a velocidade.'], diagram: 'chicane', tips: ['Frenagem moderada','S fluido: esq→dir→esq','Gás entre as curvas'] },
  mza_t11_parabolica: { title: 'Parabolica', paragraphs: ['A curva mais importante. Saída perfeita = tempo de volta.'], diagram: 'full_corner', tips: ['Frenagem curta','Esterço longo à direita','Aceleração é TUDO aqui'] },
};
