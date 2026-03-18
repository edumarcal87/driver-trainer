/**
 * Spa-Francorchamps — 7.004 km, Stavelot, Belgium.
 * Famous for elevation changes, high-speed corners, and unpredictable weather.
 * Steering: 0.5 = center, 0 = full left, 1 = full right
 */

export const SPA_EXERCISES = [
  // ── La Source (T1) — hairpin direita após reta de largada ──
  {
    id: 'spa_t1_la_source', name: 'La Source — Hairpin', icon: '🔴',
    desc: 'Frenagem forte no final da reta, hairpin de direita. Paciência na saída para Eau Rouge.',
    pedal: 'combined', track: 'spa', corner: 'T1',
    curves: {
      brake: t => { if(t<.05)return t/.05; if(t<.18)return 1; if(t<.5)return 1-(t-.18)/.32*.8; if(t<.6)return .2-(t-.5)/.1*.2; return 0; },
      steering: t => { if(t<.1)return .5; if(t<.25)return .5+((t-.1)/.15)*.4; if(t<.6)return .9; if(t<.8)return .9-((t-.6)/.2)*.4; return .5; },
      throttle: t => { if(t<.55)return 0; if(t<.8)return Math.pow((t-.55)/.25,.9)*.6; if(t<.95)return .6+((t-.8)/.15)*.4; return 1; },
    },
    duration: 6000, diff: 2,
  },

  // ── Eau Rouge / Raidillon (T3-T4) — compressão + subida em S ──
  {
    id: 'spa_t3_eau_rouge', name: 'Eau Rouge — Raidillon', icon: '🌊',
    desc: 'A curva mais famosa do mundo. Compressão na descida, S em alta velocidade subindo.',
    pedal: 'combined', track: 'spa', corner: 'T3',
    curves: {
      steering: t => {
        if(t<.1)return .5; if(t<.25)return .5-((t-.1)/.15)*.2; // leve esquerda (Eau Rouge)
        if(t<.4)return .3+((t-.25)/.15)*.4; // transição para direita (Raidillon)
        if(t<.65)return .7; if(t<.85)return .7-((t-.65)/.2)*.2; return .5;
      },
      throttle: t => {
        if(t<.05)return .8; if(t<.15)return .8-((t-.05)/.1)*.3; // lift leve na compressão
        if(t<.3)return .5+((t-.15)/.15)*.3; // retoma progressiva
        if(t<.6)return .8+((t-.3)/.3)*.2; return 1;
      },
    },
    duration: 5000, diff: 3,
  },

  // ── Les Combes (T5-T6) — chicane no topo da colina ──
  {
    id: 'spa_t5_les_combes', name: 'Les Combes — Chicane', icon: '⛰️',
    desc: 'Frenagem forte após a Kemmel Straight. Chicane esquerda-direita no topo.',
    pedal: 'combined', track: 'spa', corner: 'T5',
    curves: {
      brake: t => { if(t<.04)return t/.04; if(t<.15)return 1; if(t<.4)return 1-(t-.15)/.25; return 0; },
      steering: t => {
        if(t<.1)return .5; if(t<.25)return .5-((t-.1)/.15)*.3; if(t<.4)return .2;
        if(t<.55)return .2+((t-.4)/.15)*.6; if(t<.7)return .8; if(t<.85)return .8-((t-.7)/.15)*.3; return .5;
      },
      throttle: t => { if(t<.35)return 0; if(t<.5)return(t-.35)/.15*.4; if(t<.65)return .4-((t-.5)/.15)*.2; if(t<.8)return .2+((t-.65)/.15)*.8; return 1; },
    },
    duration: 5500, diff: 3,
  },

  // ── Pouhon (T11) — curva longa de esquerda em descida ──
  {
    id: 'spa_t11_pouhon', name: 'Pouhon — Curva Dupla', icon: '🏔️',
    desc: 'Curva dupla de esquerda em alta velocidade. Comprometimento total — gás parcial.',
    pedal: 'combined', track: 'spa', corner: 'T11',
    curves: {
      steering: t => {
        if(t<.08)return .5; if(t<.3)return .5-((t-.08)/.22)*.3; if(t<.5)return .2;
        if(t<.65)return .2+((t-.5)/.15)*.1; if(t<.8)return .3-((t-.65)/.15)*.1; // segunda curva
        if(t<.95)return .2+((t-.8)/.15)*.3; return .5;
      },
      throttle: t => {
        if(t<.05)return .9; if(t<.15)return .9-((t-.05)/.1)*.5; // lift
        if(t<.4)return .4+((t-.15)/.25)*.2; // feathering
        if(t<.6)return .6-((t-.4)/.2)*.2; // segunda curva
        if(t<.85)return .4+((t-.6)/.25)*.6; return 1;
      },
    },
    duration: 5500, diff: 3,
  },

  // ── Stavelot (T13-T14) — curva de direita em subida ──
  {
    id: 'spa_t13_stavelot', name: 'Stavelot', icon: '📐',
    desc: 'Curva de direita em subida. Frenagem média, esterço longo, aceleração na saída.',
    pedal: 'combined', track: 'spa', corner: 'T13',
    curves: {
      brake: t => { if(t<.05)return t/.05*.7; if(t<.15)return .7; if(t<.35)return .7-(t-.15)/.2*.7; return 0; },
      steering: t => { if(t<.1)return .5; if(t<.3)return .5+((t-.1)/.2)*.3; if(t<.6)return .8; if(t<.85)return .8-((t-.6)/.25)*.3; return .5; },
      throttle: t => { if(t<.3)return 0; if(t<.6)return Math.pow((t-.3)/.3,1.1)*.6; if(t<.85)return .6+((t-.6)/.25)*.4; return 1; },
    },
    duration: 5000, diff: 2,
  },

  // ── Blanchimont (T17) — curva rápida de esquerda ──
  {
    id: 'spa_t17_blanchimont', name: 'Blanchimont', icon: '💨',
    desc: 'Curva de alta velocidade à esquerda. Sem freio — apenas lift e comprometimento.',
    pedal: 'combined', track: 'spa', corner: 'T17',
    curves: {
      steering: t => { if(t<.1)return .5; if(t<.35)return .5-((t-.1)/.25)*.2; if(t<.65)return .3; if(t<.85)return .3+((t-.65)/.2)*.2; return .5; },
      throttle: t => { if(t<.08)return 1; if(t<.2)return 1-((t-.08)/.12)*.35; if(t<.5)return .65; if(t<.75)return .65+((t-.5)/.25)*.35; return 1; },
    },
    duration: 4000, diff: 3,
  },

  // ── Bus Stop Chicane (T18-T19) — chicane final ──
  {
    id: 'spa_t18_bus_stop', name: 'Bus Stop — Chicane Final', icon: '🚌',
    desc: 'Frenagem forte antes da chicane. Direita-esquerda rápida antes da reta de largada.',
    pedal: 'combined', track: 'spa', corner: 'T18',
    curves: {
      brake: t => { if(t<.04)return t/.04; if(t<.12)return 1; if(t<.35)return 1-(t-.12)/.23; return 0; },
      steering: t => {
        if(t<.08)return .5; if(t<.2)return .5+((t-.08)/.12)*.3; if(t<.35)return .8;
        if(t<.5)return .8-((t-.35)/.15)*.6; if(t<.65)return .2;
        if(t<.8)return .2+((t-.65)/.15)*.3; return .5;
      },
      throttle: t => { if(t<.3)return 0; if(t<.45)return(t-.3)/.15*.3; if(t<.55)return .3-((t-.45)/.1)*.15; if(t<.7)return .15+((t-.55)/.15)*.85; return 1; },
    },
    duration: 5500, diff: 3,
  },
];

export const SPA_TUTORIALS = {
  spa_t1_la_source: { title: 'La Source — Hairpin', paragraphs: ['Primeira curva após a largada. Frenagem pesada e hairpin de direita.','Paciência na saída — aceleração prematura aqui custa velocidade na Eau Rouge.'], diagram: 'full_corner', tips: ['Frenagem forte e longa','Esterço quase total à direita','Saída suave — pense na Eau Rouge'] },
  spa_t3_eau_rouge: { title: 'Eau Rouge — Raidillon', paragraphs: ['A curva mais icônica do automobilismo. S em alta velocidade com compressão e subida.','Não é flat-out para todos os carros. Lift leve na compressão, comprometimento na subida.'], diagram: 'chicane', tips: ['Lift leve na compressão','Transição esquerda→direita fluida','Gás progressivo na subida'] },
  spa_t5_les_combes: { title: 'Les Combes', paragraphs: ['Chicane no topo da colina após a Kemmel Straight.','Frenagem forte de alta velocidade, chicane esquerda-direita técnica.'], diagram: 'full_corner', tips: ['Frenagem forte — vem de 300+ km/h','Chicane: esquerda primeiro, depois direita','Gás entre as curvas'] },
  spa_t11_pouhon: { title: 'Pouhon', paragraphs: ['Curva dupla de esquerda em alta velocidade.','Comprometimento total — feathering no apex, sem freio.'], diagram: 'feathering', tips: ['SEM FREIO — apenas lift','Feathering ~40-60% no apex','Comprometimento mental é tudo'] },
  spa_t13_stavelot: { title: 'Stavelot', paragraphs: ['Curva de direita em subida. A saída define velocidade na reta do Blanchimont.'], diagram: 'full_corner', tips: ['Frenagem média','Esterço longo à direita','Aceleração progressiva na saída'] },
  spa_t17_blanchimont: { title: 'Blanchimont', paragraphs: ['Curva de alta velocidade à esquerda. Uma das mais rápidas do calendário.','Sem freio — confiança pura.'], diagram: 'feathering', tips: ['SEM FREIO','Lift breve e voltar ao gás','Coragem e compromisso'] },
  spa_t18_bus_stop: { title: 'Bus Stop Chicane', paragraphs: ['Chicane final antes da reta de largada. Frenagem de alta velocidade.','Boa saída = velocidade na reta.'], diagram: 'full_corner', tips: ['Frenagem forte de alta velocidade','Chicane direita→esquerda rápida','Saída é crucial para o tempo de volta'] },
};
