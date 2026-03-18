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
