/**
 * Silverstone Circuit — 5.891 km, Northamptonshire, England.
 * Home of British GP — fast flowing corners, Maggotts-Becketts complex.
 * Steering: 0.5 = center, 0 = full left, 1 = full right
 */

export const SILVERSTONE_EXERCISES = [
  // ── Copse (T9) — curva rápida de direita ──
  {
    id: 'slv_t9_copse', name: 'Copse', icon: '💨',
    desc: 'Curva rápida de direita. Alta velocidade com gás parcial.',
    pedal: 'combined', track: 'silverstone', corner: 'T9',
    curves: {
      brake: t => { if(t<.04)return t/.04*.5; if(t<.12)return .5; if(t<.25)return .5-(t-.12)/.13*.5; return 0; },
      steering: t => { if(t<.1)return .5; if(t<.3)return .5+((t-.1)/.2)*.25; if(t<.6)return .75; if(t<.8)return .75-((t-.6)/.2)*.25; return .5; },
      throttle: t => { if(t<.08)return 1; if(t<.18)return 1-((t-.08)/.1)*.4; if(t<.45)return .6; if(t<.7)return .6+((t-.45)/.25)*.4; return 1; },
    },
    duration: 4000, diff: 2,
  },

  // ── Maggotts-Becketts-Chapel (T10-T13) — complexo de curvas rápidas ──
  {
    id: 'slv_t10_maggotts', name: 'Maggotts-Becketts-Chapel', icon: '🔀',
    desc: 'O complexo mais famoso: S rápido esquerda-direita-esquerda. Fluidez total.',
    pedal: 'combined', track: 'silverstone', corner: 'T10',
    curves: {
      steering: t => {
        if(t<.05)return .5;
        if(t<.15)return .5-((t-.05)/.1)*.3; // Maggotts esquerda
        if(t<.25)return .2;
        if(t<.38)return .2+((t-.25)/.13)*.6; // Becketts direita
        if(t<.52)return .8;
        if(t<.65)return .8-((t-.52)/.13)*.5; // Chapel esquerda
        if(t<.78)return .3;
        if(t<.9)return .3+((t-.78)/.12)*.2;
        return .5;
      },
      throttle: t => {
        if(t<.03)return .9;
        if(t<.12)return .9-((t-.03)/.09)*.4; // lift Maggotts
        if(t<.22)return .5+((t-.12)/.1)*.3; // gás entre
        if(t<.32)return .8-((t-.22)/.1)*.4; // lift Becketts
        if(t<.45)return .4+((t-.32)/.13)*.3; // gás
        if(t<.55)return .7-((t-.45)/.1)*.3; // lift Chapel
        if(t<.7)return .4+((t-.55)/.15)*.4;
        if(t<.85)return .8+((t-.7)/.15)*.2;
        return 1;
      },
    },
    duration: 6000, diff: 3,
  },

  // ── Stowe (T14) — curva de direita em frenagem ──
  {
    id: 'slv_t14_stowe', name: 'Stowe', icon: '🏎️',
    desc: 'Curva rápida de direita após a reta da Hangar. Frenagem forte em alta velocidade.',
    pedal: 'combined', track: 'silverstone', corner: 'T14',
    curves: {
      brake: t => { if(t<.04)return t/.04; if(t<.15)return 1; if(t<.4)return 1-(t-.15)/.25; return 0; },
      steering: t => { if(t<.1)return .5; if(t<.3)return .5+((t-.1)/.2)*.3; if(t<.6)return .8; if(t<.8)return .8-((t-.6)/.2)*.3; return .5; },
      throttle: t => { if(t<.35)return 0; if(t<.65)return Math.pow((t-.35)/.3,1.1); return 1; },
    },
    duration: 5000, diff: 3,
  },

  // ── Vale-Club (T15-T16) — chicane lenta ──
  {
    id: 'slv_t15_vale', name: 'Vale-Club — Chicane', icon: '🔄',
    desc: 'Chicane lenta de esquerda-direita. Frenagem forte, paciência na saída.',
    pedal: 'combined', track: 'silverstone', corner: 'T15',
    curves: {
      brake: t => { if(t<.05)return t/.05; if(t<.2)return 1; if(t<.45)return 1-(t-.2)/.25*.8; if(t<.55)return .2-(t-.45)/.1*.2; return 0; },
      steering: t => {
        if(t<.1)return .5; if(t<.25)return .5-((t-.1)/.15)*.3; if(t<.4)return .2;
        if(t<.55)return .2+((t-.4)/.15)*.5; if(t<.7)return .7;
        if(t<.85)return .7-((t-.7)/.15)*.2; return .5;
      },
      throttle: t => { if(t<.5)return 0; if(t<.65)return(t-.5)/.15*.3; if(t<.75)return .3+((t-.65)/.1)*.3; if(t<.9)return .6+((t-.75)/.15)*.4; return 1; },
    },
    duration: 5500, diff: 2,
  },

  // ── Abbey (T17) — curva rápida de direita ──
  {
    id: 'slv_t17_abbey', name: 'Abbey', icon: '⛪',
    desc: 'Curva rápida de direita. Pouco freio, gás parcial no apex.',
    pedal: 'combined', track: 'silverstone', corner: 'T17',
    curves: {
      brake: t => { if(t<.04)return t/.04*.4; if(t<.12)return .4; if(t<.22)return .4-(t-.12)/.1*.4; return 0; },
      steering: t => { if(t<.1)return .5; if(t<.3)return .5+((t-.1)/.2)*.2; if(t<.6)return .7; if(t<.8)return .7-((t-.6)/.2)*.2; return .5; },
      throttle: t => { if(t<.05)return 1; if(t<.15)return 1-((t-.05)/.1)*.4; if(t<.4)return .6; if(t<.65)return .6+((t-.4)/.25)*.4; return 1; },
    },
    duration: 4000, diff: 2,
  },

  // ── Luffield (T18) — hairpin de esquerda ──
  {
    id: 'slv_t18_luffield', name: 'Luffield', icon: '↩️',
    desc: 'Hairpin lento de esquerda. Frenagem forte, esterço máximo, saída para reta de largada.',
    pedal: 'combined', track: 'silverstone', corner: 'T18',
    curves: {
      brake: t => { if(t<.05)return t/.05; if(t<.2)return 1; if(t<.5)return 1-(t-.2)/.3*.8; if(t<.6)return .2-(t-.5)/.1*.2; return 0; },
      steering: t => { if(t<.12)return .5; if(t<.3)return .5-((t-.12)/.18)*.4; if(t<.65)return .1; if(t<.85)return .1+((t-.65)/.2)*.4; return .5; },
      throttle: t => { if(t<.5)return 0; if(t<.7)return Math.pow((t-.5)/.2,.8)*.5; if(t<.9)return .5+((t-.7)/.2)*.5; return 1; },
    },
    duration: 5500, diff: 2,
  },
];

export const SILVERSTONE_TUTORIALS = {
  slv_t9_copse: { title: 'Copse', paragraphs: ['Curva rápida de direita. Uma das curvas mais corajosas do calendário.'], diagram: 'feathering', tips: ['Frenagem leve','Gás parcial ~60% no apex','Comprometimento com o grip'] },
  slv_t10_maggotts: { title: 'Maggotts-Becketts-Chapel', paragraphs: ['O complexo de curvas mais fluido da F1. S rápido que exige ritmo perfeito.','Cada transição deve ser suave — hesitação aqui perde muito tempo.'], diagram: 'chicane', tips: ['Fluidez > velocidade individual','Lift entre curvas, nunca freio','Transições rápidas e confiantes'] },
  slv_t14_stowe: { title: 'Stowe', paragraphs: ['Frenagem forte após a reta da Hangar. Curva de direita técnica.'], diagram: 'full_corner', tips: ['Frenagem forte de alta velocidade','Trail braking na entrada','Aceleração na saída'] },
  slv_t15_vale: { title: 'Vale-Club', paragraphs: ['Chicane lenta de esquerda-direita. Paciência e precisão.'], diagram: 'full_corner', tips: ['Frenagem longa','Chicane esq→dir','Saída paciente'] },
  slv_t17_abbey: { title: 'Abbey', paragraphs: ['Curva rápida de direita. Pouco freio necessário.'], diagram: 'feathering', tips: ['Frenagem leve','Gás parcial','Curva de comprometimento'] },
  slv_t18_luffield: { title: 'Luffield', paragraphs: ['Hairpin de esquerda. Saída crucial para velocidade na reta de largada.'], diagram: 'full_corner', tips: ['Frenagem forte','Esterço máximo esquerda','Saída = velocidade na reta'] },
};
