/**
 * Tutorial content for each exercise type and key techniques.
 * Shown on first encounter with each exercise type.
 */

export const TUTORIALS = {
  b_threshold: {
    title: 'O que é Threshold Braking?',
    paragraphs: [
      'É a frenagem no limite máximo de aderência — 100% de pressão sem travar as rodas.',
      'Na prática: pise forte e rápido, mantenha constante, e solte no ponto de entrada da curva.',
    ],
    diagram: 'threshold', // SVG key
    tips: ['Pise rápido no início — não suba devagar', 'Mantenha a pressão estável no meio', 'Solte suavemente no final'],
  },
  b_trail: {
    title: 'O que é Trail Braking?',
    paragraphs: [
      'Trail braking é a técnica MAIS IMPORTANTE do sim racing. Você freia forte na reta e vai soltando o freio gradualmente conforme entra na curva.',
      'Isso transfere peso para a dianteira, dando mais grip para esterçar. É o que separa pilotos rápidos dos muito rápidos.',
    ],
    diagram: 'trail',
    tips: ['Ataque forte — como no threshold', 'Solte progressivamente, nunca de golpe', 'A curva de soltura deve ser suave como uma rampa'],
  },
  b_progressive: {
    title: 'Frenagem Progressiva',
    paragraphs: [
      'Ao contrário do threshold, aqui você constrói a pressão gradualmente até o pico.',
      'Útil em curvas de alta velocidade onde travar seria desastroso.',
    ],
    diagram: 'progressive',
    tips: ['Comece leve e aumente gradualmente', 'O pico vem no meio/final do exercício', 'Mantenha a subida suave e linear'],
  },
  b_stab: {
    title: 'Stab Braking',
    paragraphs: [
      'Um toque rápido e agressivo no freio — pisar e soltar em fração de segundo.',
      'Usado para pequenas correções de velocidade em curvas rápidas.',
    ],
    diagram: 'stab',
    tips: ['Seja rápido — pise e solte', 'Não prolongue a pressão', 'O pico deve ser curto e preciso'],
  },
  t_smooth_exit: {
    title: 'Saída Suave de Curva',
    paragraphs: [
      'A aceleração na saída de curva deve ser progressiva — comece leve e aumente conforme o volante endireita.',
      'Dosar errado causa oversteer (traseira escorrega) ou perda de tempo.',
    ],
    diagram: 'smooth_exit',
    tips: ['Comece com 0% e suba devagar', 'Só vá a 100% quando o volante estiver reto', 'A curva de aceleração é exponencial, não linear'],
  },
  t_feathering: {
    title: 'O que é Feathering?',
    paragraphs: [
      'Feathering é dosar o acelerador parcialmente — manter um valor entre 20-50% por período prolongado.',
      'Essencial em curvas de alta velocidade onde 100% causa perda de tração.',
    ],
    diagram: 'feathering',
    tips: ['Mantenha o pé leve e estável', 'Siga as oscilações da curva-alvo', 'Não tente ficar em 100% — o objetivo é modulação'],
  },
  s_smooth_turn_r: {
    title: 'Esterço Suave',
    paragraphs: [
      'Uma curva suave requer movimento progressivo do volante — entre gradualmente, mantenha, e saia gradualmente.',
      'Movimentos bruscos causam perda de grip. Suavidade é velocidade.',
    ],
    diagram: 'smooth_turn',
    tips: ['Entre na curva progressivamente', 'Mantenha o ângulo estável no meio', 'Desfaça o esterço com a mesma suavidade que entrou'],
  },
  s_chicane: {
    title: 'O que é uma Chicane?',
    paragraphs: [
      'Chicane é uma sequência rápida de curvas em direções opostas — esquerda-direita ou direita-esquerda.',
      'O segredo é a transição: mudar de direção de forma fluida, sem hesitação.',
    ],
    diagram: 'chicane',
    tips: ['A transição entre lados deve ser fluida', 'Não pare no centro — passe direto', 'Ritmo é mais importante que precisão absoluta'],
  },
  x_trail_throttle: {
    title: 'Trail Brake → Aceleração',
    paragraphs: [
      'A combinação mais usada em corridas: frear com trail braking e fazer a transição para o acelerador.',
      'O momento exato em que o freio solta e o gás entra determina a saída da curva.',
    ],
    diagram: 'trail_throttle',
    tips: ['O freio vermelho cai enquanto o gás verde sobe', 'Não sobreponha — quando um sai, o outro entra', 'A transição deve ser suave, não abrupta'],
  },
  x_heel_toe: {
    title: 'O que é Heel-Toe?',
    paragraphs: [
      'Heel-toe é a técnica de usar os 3 pedais simultaneamente: freio (ponta do pé), acelerador (calcanhar) e embreagem.',
      'Serve para fazer reduções de marcha durante a frenagem sem desestabilizar o carro.',
    ],
    diagram: 'heel_toe',
    tips: ['O freio (vermelho) mantém constante', 'A embreagem (amarelo) faz pulsos rápidos', 'O acelerador (verde) dá um "blip" rápido junto com a embreagem'],
  },
  x_full_corner: {
    title: 'A Curva Completa',
    paragraphs: [
      'O exercício definitivo: freio → volante → acelerador numa sequência fluida.',
      'É assim que um piloto aborda cada curva no circuito. Dominar isso é dominar o sim racing.',
    ],
    diagram: 'full_corner',
    tips: ['Freio primeiro (vermelho), forte e trail', 'Volante (azul) entra quando o freio começa a sair', 'Acelerador (verde) só depois que o volante começa a desfazer'],
  },
  // ── Gear exercises ──
  seq_upshift_basic: {
    title: 'Subida de Marchas — Sequencial',
    paragraphs: [
      'A troca de marcha ideal: gás a fundo, paddle no momento certo, breve lift do acelerador durante a troca.',
      'O timing é tudo. Troque cedo demais e o motor não terá potência na próxima marcha. Tarde demais e perde tempo no limitador.',
    ],
    diagram: 'smooth_exit',
    tips: ['Acompanhe a linha laranja (MARCHA) — troque quando ela subir', 'Levante brevemente o acelerador a cada troca', 'O ritmo é mais importante que a velocidade'],
  },
  seq_downshift_basic: {
    title: 'Descida de Marchas — Sequencial',
    paragraphs: [
      'Reduzir marchas durante a frenagem. Cada redução deve coincidir com a desaceleração do carro.',
      'Com borboletas, o timing é simples: reduza conforme a velocidade cai. O carro faz o rev match automaticamente (com sequencial).',
    ],
    diagram: 'trail',
    tips: ['Freie primeiro, depois comece a reduzir', 'Uma redução a cada ~0.5 segundo', 'A linha laranja mostra quando cada redução deve acontecer'],
  },
  seq_braking_downshift: {
    title: 'Frenagem com Reduções',
    paragraphs: [
      'O cenário completo: frenagem forte + trail + reduções sequenciais. Três inputs simultâneos.',
      'Os blips de acelerador (verde) são o rev match — coincida cada blip com uma redução.',
    ],
    diagram: 'full_corner',
    tips: ['Freio vermelho constante enquanto reduz', 'Blip verde rápido a cada redução', 'Linha laranja = marcha alvo — siga ela com as borboletas'],
  },
  hpat_upshift_basic: {
    title: 'Subida H-Pattern',
    paragraphs: [
      'Com câmbio H, cada troca exige coordenação: embreagem → move alavanca → solta embreagem.',
      'O acelerador precisa ser levantado durante a troca e reaplicado imediatamente depois.',
    ],
    diagram: 'smooth_exit',
    tips: ['Embreagem (amarelo) sobe antes da troca', 'Mova a alavanca durante o pico de embreagem', 'Solte a embreagem + reaplique o gás juntos'],
  },
  hpat_downshift_heel_toe: {
    title: 'Heel-Toe com H-Pattern',
    paragraphs: [
      'A técnica mais difícil do sim racing: freio com a ponta do pé, blip de acelerador com o calcanhar, embreagem + câmbio H — tudo simultaneamente.',
      'É 4 inputs ao mesmo tempo. Domine cada parte antes de combinar.',
    ],
    diagram: 'heel_toe',
    tips: ['Freio (vermelho) mantém constante durante tudo', 'Embreagem (amarelo) + câmbio H = a troca', 'Blip de acelerador (verde) coincide com a embreagem para equalizar rotação'],
  },
  // ── Interlagos scenarios ──
  ilg_t1_senna_s: {
    title: 'Curva 1 — Senna S',
    paragraphs: [
      'A curva mais icônica de Interlagos. Frenagem forte no final da reta dos boxes, com trail braking longo na entrada à esquerda.',
      'Solte o freio gradualmente enquanto esterça. Frear demais na curva trava a dianteira.',
    ],
    diagram: 'full_corner',
    tips: ['Frenagem forte mas curta — ataque rápido', 'Trail longo: freio sai enquanto volante entra', 'Acelerador só quando o volante desfaz'],
  },
  ilg_t8_pinheirinho: {
    title: 'Curva 8 — Pinheirinho',
    paragraphs: [
      'Hairpin lento que exige paciência. Frenagem forte, esterço máximo, saída controlada.',
      'O erro mais comum: acelerar cedo demais. Espere o carro apontar antes de pisar no gás.',
    ],
    diagram: 'full_corner',
    tips: ['Freie forte e mantenha', 'Esterço quase total à esquerda', 'Saída com calma — gás só quando endireitar'],
  },
  ilg_t12_juncao: {
    title: 'Curva 12 — Junção',
    paragraphs: [
      'A curva mais importante: boa saída = velocidade na reta dos boxes.',
      'Trail curto, foco na aceleração: comece leve e construa até 100%.',
    ],
    diagram: 'trail_throttle',
    tips: ['Frenagem curta e eficiente', 'Aceleração progressiva', 'Cada 1% a mais na saída = tempo na reta'],
  },
  ilg_t10_mergulho: {
    title: 'Curva 10 — Mergulho',
    paragraphs: [
      'Descida mais íngreme do circuito. A transferência de peso muda — freio mais modulado.',
      'Construa pressão gradualmente, não ataque de golpe.',
    ],
    diagram: 'progressive',
    tips: ['Na descida, ataque gradual', 'Build up: 70% → 100%', 'Trail braking standard na saída'],
  },
  ilg_t2_senna_s2: {
    title: 'Curva 2 — Senna S (saída)',
    paragraphs: [
      'Segunda parte do S do Senna. Transição rápida da esquerda para a direita.',
      'Acelerador dosado na transição — gás parcial entre as curvas, full gas na saída.',
    ],
    diagram: 'chicane',
    tips: ['Transição fluida — não hesite', 'Gás parcial entre os lados', 'Full gas só na saída'],
  },
  ilg_t3_curva_sol: {
    title: 'Curva 3 — Curva do Sol',
    paragraphs: [
      'Média velocidade à esquerda. Frenagem mais leve que a T1, trail longo e gradual.',
      'Boa saída aqui dá velocidade na reta oposta.',
    ],
    diagram: 'trail',
    tips: ['Frenagem leve — não a fundo', 'Trail longo e suave', 'Boa saída = velocidade na reta oposta'],
  },
  ilg_t4_descida_lago: {
    title: 'Curva 4 — Descida do Lago',
    paragraphs: [
      'Frenagem em descida forte. O grip muda na descida — menos pressão inicial.',
      'Evite travar as rodas. Use threshold mais leve (~85%).',
    ],
    diagram: 'progressive',
    tips: ['Ataque mais suave na descida', 'Threshold ~85%, não 100%', 'Trail standard na saída'],
  },
  ilg_t6_laranjinha: {
    title: 'Curva 6 — Laranjinha',
    paragraphs: [
      'Curva rápida SEM FREIO! Apenas lift do acelerador e feathering no apex.',
      'Curva de comprometimento — entre com confiança.',
    ],
    diagram: 'feathering',
    tips: ['SEM FREIO — tire o pé do gás', 'Feathering ~35% no apex', 'Aceleração progressiva na saída'],
  },
  ilg_t7_ferradura: {
    title: 'Curva 7 — Ferradura',
    paragraphs: [
      'Curva longa de direita. Esterço prolongado, aceleração gradual.',
      'O erro comum: acelerar cedo e sair de pista na saída.',
    ],
    diagram: 'full_corner',
    tips: ['Frenagem média e curta', 'Mantenha esterço por bastante tempo', 'Aceleração só quando o carro "apoiar"'],
  },
  ilg_t11_bico_pato: {
    title: 'Curva 11 — Bico de Pato',
    paragraphs: [
      'Frenagem forte na subida para curva rápida de esquerda.',
      'Em subida o carro tem mais grip — pode atacar mais agressivamente.',
    ],
    diagram: 'trail',
    tips: ['Ataque forte — subida dá grip', 'Trail curto — solte rápido', 'Aceleração progressiva'],
  },
  ilg_t13_subida_boxes: {
    title: 'Subida dos Boxes',
    paragraphs: [
      'Após a Junção, aceleração máxima na subida para a reta.',
      'Endireite o volante enquanto sobe o acelerador a 100%.',
    ],
    diagram: 'smooth_exit',
    tips: ['Volante endireitando', 'Acelerador a fundo rápido', 'Velocidade na reta depende desta saída'],
  },
  ilg_pit_entry: {
    title: 'Entrada de Boxes',
    paragraphs: [
      'Desacelere controladamente para o pit lane. Respeite o limite de velocidade!',
      'Freio moderado e constante, desvio suave para a direita.',
    ],
    diagram: 'progressive',
    tips: ['Freio moderado', 'Desvio suave para a direita', 'Sem acelerador no pit'],
  },
};

// Live coaching tips shown DURING exercise based on real-time performance
export const LIVE_TIPS = {
  too_strong: { text: 'Pressão demais — alivie o pedal', color: '#e74c3c', icon: '⬆️' },
  too_weak: { text: 'Pressão insuficiente — pise mais', color: '#f39c12', icon: '⬇️' },
  too_late: { text: 'Reaja mais rápido — a curva já subiu', color: '#e74c3c', icon: '⏪' },
  too_early: { text: 'Cedo demais — espere a curva subir', color: '#f39c12', icon: '⏩' },
  good: { text: 'Boa! Mantenha assim', color: '#27ae60', icon: '✓' },
  great: { text: 'Excelente precisão!', color: '#27ae60', icon: '★' },
  release_slow: { text: 'Solte mais rápido', color: '#f39c12', icon: '↓' },
  hold_steady: { text: 'Mantenha firme — não oscile', color: '#2980b9', icon: '〰️' },
};

/**
 * Analyze real-time input vs target and return a tip key.
 * ALWAYS returns a tip when outside tolerance zone.
 */
export function getLiveTip(targetVal, userVal, progress, leadInRatio, recentDiffs) {
  // No tips during lead-in zone
  if (progress < (leadInRatio || 0.15) + 0.03) return null;

  // No tips at the very end
  if (progress > 0.95) return null;

  const diff = userVal - targetVal;

  // Use average of recent diffs for stability (avoid flickering)
  const diffs = Array.isArray(recentDiffs) && recentDiffs.length > 0 ? recentDiffs : [diff];
  const avgDiff = diffs.reduce((s, d) => s + d, 0) / diffs.length;
  const avgAbsDiff = Math.abs(avgDiff);

  // Excellent tracking (within tolerance band ~0.08)
  if (avgAbsDiff < 0.05) return 'great';
  if (avgAbsDiff < 0.08) return 'good';

  // ── Outside tolerance — ALWAYS give corrective feedback ──

  // Target is near zero and user is pressing (too early / should release)
  if (targetVal < 0.08 && userVal > 0.2) return 'too_early';

  // Target is high and user hasn't moved (too late / not reacting)
  if (targetVal > 0.3 && userVal < 0.1) return 'too_late';

  // Target is dropping but user is still high (slow to release)
  if (targetVal < 0.15 && userVal > 0.3) return 'release_slow';

  // User is above target
  if (avgDiff > 0.08) return 'too_strong';

  // User is below target
  if (avgDiff < -0.08) return 'too_weak';

  // Fallback — moderate deviation, encourage steadiness
  return 'hold_steady';
}
