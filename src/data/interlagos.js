/**
 * Interlagos (Autódromo José Carlos Pace) — real track scenarios.
 *
 * Each scenario simulates the pedal/steering inputs for a specific section.
 * Curves are based on real driving patterns for that corner:
 * - Brake zones, trail braking angles, throttle application points
 * - Steering inputs matching corner geometry
 * - Duration proportional to real time spent in that section
 *
 * Steering: 0.5 = center, 0 = full left, 1 = full right
 * Pedals: 0 = released, 1 = fully pressed
 */

export const INTERLAGOS_EXERCISES = [
  // ── T1: Senna S (parte 1) — frenagem forte + curva à esquerda ──
  {
    id: 'ilg_t1_senna_s',
    name: 'Curva 1 — Senna S (entrada)',
    desc: 'Frenagem forte no final da reta dos boxes, trail braking na entrada da curva à esquerda.',
    icon: '🏁',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T1',
    curves: {
      brake: t => {
        if (t < 0.05) return t / 0.05;          // ataque rápido
        if (t < 0.15) return 1;                   // threshold
        if (t < 0.55) return 1 - (t - 0.15) / 0.4; // trail braking longo
        return 0;
      },
      steering: t => {
        if (t < 0.1) return 0.5;                  // reta
        if (t < 0.35) return 0.5 - ((t - 0.1) / 0.25) * 0.35; // esterço esquerda
        if (t < 0.6) return 0.15;                 // hold esquerda
        if (t < 0.85) return 0.15 + ((t - 0.6) / 0.25) * 0.35; // desfaz
        return 0.5;
      },
      throttle: t => {
        if (t < 0.5) return 0;                    // sem gás na frenagem
        if (t < 0.85) return Math.pow((t - 0.5) / 0.35, 1.2); // aceleração progressiva
        return 1;
      },
    },
    duration: 5500, diff: 3,
  },

  // ── T2: Senna S (parte 2) — transição rápida direita ──
  {
    id: 'ilg_t2_senna_s2',
    name: 'Curva 2 — Senna S (saída)',
    desc: 'Transição rápida para a direita com aceleração na saída do S.',
    icon: '🔀',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T2',
    curves: {
      steering: t => {
        if (t < 0.05) return 0.25;                // vindo da esquerda
        if (t < 0.3) return 0.25 + ((t - 0.05) / 0.25) * 0.55; // transição para direita
        if (t < 0.65) return 0.8;                 // hold direita
        if (t < 0.9) return 0.8 - ((t - 0.65) / 0.25) * 0.3; // desfaz
        return 0.5;
      },
      throttle: t => {
        if (t < 0.15) return 0.2;                 // gás parcial na transição
        if (t < 0.35) return 0.2 - ((t - 0.15) / 0.2) * 0.15; // lift
        if (t < 0.6) return 0.05 + ((t - 0.35) / 0.25) * 0.5; // retoma
        if (t < 0.85) return 0.55 + ((t - 0.6) / 0.25) * 0.45; // full gas
        return 1;
      },
    },
    duration: 4000, diff: 2,
  },

  // ── T4: Descida do Lago — frenagem em descida + curva esquerda ──
  {
    id: 'ilg_t4_descida_lago',
    name: 'Curva 4 — Descida do Lago',
    desc: 'Frenagem em descida com trail braking. A gravidade reduz o grip — suavidade é chave.',
    icon: '⬇️',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T4',
    curves: {
      brake: t => {
        if (t < 0.06) return t / 0.06 * 0.85;    // ataque moderado (descida!)
        if (t < 0.2) return 0.85;                 // threshold mais leve
        if (t < 0.6) return 0.85 - (t - 0.2) / 0.4 * 0.85; // trail longo
        return 0;
      },
      steering: t => {
        if (t < 0.15) return 0.5;
        if (t < 0.4) return 0.5 - ((t - 0.15) / 0.25) * 0.3;
        if (t < 0.7) return 0.2;
        if (t < 0.9) return 0.2 + ((t - 0.7) / 0.2) * 0.3;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.55) return 0;
        if (t < 0.9) return Math.pow((t - 0.55) / 0.35, 1.1);
        return 1;
      },
    },
    duration: 5000, diff: 3,
  },

  // ── T6: Laranjinha — curva rápida de esquerda ──
  {
    id: 'ilg_t6_laranjinha',
    name: 'Curva 6 — Laranjinha',
    desc: 'Curva rápida à esquerda — acelerador parcial com esterço suave. Sem freio!',
    icon: '🍊',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T6',
    curves: {
      steering: t => {
        if (t < 0.1) return 0.5;
        if (t < 0.35) return 0.5 - ((t - 0.1) / 0.25) * 0.25;
        if (t < 0.65) return 0.25;
        if (t < 0.9) return 0.25 + ((t - 0.65) / 0.25) * 0.25;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.05) return 0.8;
        if (t < 0.2) return 0.8 - ((t - 0.05) / 0.15) * 0.45; // lift para entrada
        if (t < 0.5) return 0.35;                // feathering no apex
        if (t < 0.8) return 0.35 + ((t - 0.5) / 0.3) * 0.65; // aceleração na saída
        return 1;
      },
    },
    duration: 4000, diff: 2,
  },

  // ── T8: Pinheirinho — frenagem forte + hairpin esquerda ──
  {
    id: 'ilg_t8_pinheirinho',
    name: 'Curva 8 — Pinheirinho',
    desc: 'Frenagem forte para hairpin lento. Esterço máximo à esquerda, saída com paciência.',
    icon: '🌲',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T8',
    curves: {
      brake: t => {
        if (t < 0.05) return t / 0.05;
        if (t < 0.2) return 1;
        if (t < 0.5) return 1 - (t - 0.2) / 0.3 * 0.8;
        if (t < 0.65) return 0.2 - (t - 0.5) / 0.15 * 0.2;
        return 0;
      },
      steering: t => {
        if (t < 0.12) return 0.5;
        if (t < 0.3) return 0.5 - ((t - 0.12) / 0.18) * 0.45;
        if (t < 0.65) return 0.05;               // full lock esquerda
        if (t < 0.9) return 0.05 + ((t - 0.65) / 0.25) * 0.45;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.55) return 0;
        if (t < 0.75) return Math.pow((t - 0.55) / 0.2, 0.8) * 0.5; // saída cuidadosa
        if (t < 0.95) return 0.5 + ((t - 0.75) / 0.2) * 0.5;
        return 1;
      },
    },
    duration: 6000, diff: 3,
  },

  // ── T10: Mergulho — frenagem em descida forte ──
  {
    id: 'ilg_t10_mergulho',
    name: 'Curva 10 — Mergulho',
    desc: 'A descida mais íngreme do circuito. Freio modulado para não travar na descida.',
    icon: '📉',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T10',
    curves: {
      brake: t => {
        if (t < 0.08) return t / 0.08 * 0.7;    // ataque moderado
        if (t < 0.3) return 0.7 + (t - 0.08) / 0.22 * 0.3; // build up
        if (t < 0.5) return 1;                    // threshold
        if (t < 0.8) return 1 - (t - 0.5) / 0.3; // trail
        return 0;
      },
      steering: t => {
        if (t < 0.3) return 0.5;
        if (t < 0.55) return 0.5 - ((t - 0.3) / 0.25) * 0.3;
        if (t < 0.8) return 0.2;
        if (t < 0.95) return 0.2 + ((t - 0.8) / 0.15) * 0.3;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.7) return 0;
        if (t < 0.95) return Math.pow((t - 0.7) / 0.25, 1.3);
        return 1;
      },
    },
    duration: 5500, diff: 3,
  },

  // ── T12: Junção — última curva antes da reta ──
  {
    id: 'ilg_t12_juncao',
    name: 'Curva 12 — Junção',
    desc: 'A curva mais importante: boa saída aqui = boa velocidade na reta. Aceleração perfeita.',
    icon: '🏎️',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T12',
    curves: {
      brake: t => {
        if (t < 0.05) return t / 0.05 * 0.9;
        if (t < 0.12) return 0.9;
        if (t < 0.35) return 0.9 - (t - 0.12) / 0.23 * 0.9;
        return 0;
      },
      steering: t => {
        if (t < 0.08) return 0.5;
        if (t < 0.3) return 0.5 - ((t - 0.08) / 0.22) * 0.3;
        if (t < 0.6) return 0.2;
        if (t < 0.85) return 0.2 + ((t - 0.6) / 0.25) * 0.3;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.3) return 0;
        if (t < 0.5) return Math.pow((t - 0.3) / 0.2, 0.9) * 0.4;
        if (t < 0.75) return 0.4 + ((t - 0.5) / 0.25) * 0.35;
        if (t < 0.95) return 0.75 + ((t - 0.75) / 0.2) * 0.25;
        return 1;
      },
    },
    duration: 5500, diff: 3,
  },

  // ── Entrada dos boxes — frenagem + desvio ──
  {
    id: 'ilg_pit_entry',
    name: 'Entrada de Boxes',
    desc: 'Desacelere na reta dos boxes e desvie para o pit lane com precisão.',
    icon: '🅿️',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'PIT',
    curves: {
      brake: t => {
        if (t < 0.1) return 0;
        if (t < 0.2) return (t - 0.1) / 0.1 * 0.6;
        if (t < 0.5) return 0.6;
        if (t < 0.7) return 0.6 - (t - 0.5) / 0.2 * 0.4;
        if (t < 0.9) return 0.2;
        return 0.2 - (t - 0.9) / 0.1 * 0.2;
      },
      steering: t => {
        if (t < 0.3) return 0.5;
        if (t < 0.5) return 0.5 + ((t - 0.3) / 0.2) * 0.2;
        if (t < 0.8) return 0.7;
        if (t < 0.95) return 0.7 - ((t - 0.8) / 0.15) * 0.2;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.1) return 0.4;
        return 0;
      },
    },
    duration: 6000, diff: 2,
  },

  // ── Saída dos boxes — aceleração controlada + merge na pista ──
  {
    id: 'ilg_pit_exit',
    name: 'Saída de Boxes',
    desc: 'Saia do pit lane, respeite o limite de velocidade até a linha e acelere para a pista.',
    icon: '🚦',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'PIT_EXIT',
    curves: {
      brake: t => {
        return 0; // sem freio na saída
      },
      steering: t => {
        if (t < 0.2) return 0.5; // pit lane reto
        if (t < 0.4) return 0.5 - ((t - 0.2) / 0.2) * 0.15; // merge suave para a esquerda
        if (t < 0.6) return 0.35;
        if (t < 0.8) return 0.35 + ((t - 0.6) / 0.2) * 0.15; // volta ao centro
        return 0.5;
      },
      throttle: t => {
        if (t < 0.3) return 0.3; // velocidade de pit controlada
        if (t < 0.4) return 0.3 + ((t - 0.3) / 0.1) * 0.3; // começa a acelerar
        if (t < 0.7) return 0.6 + ((t - 0.4) / 0.3) * 0.4; // aceleração progressiva
        return 1; // full gas na pista
      },
    },
    duration: 5000, diff: 1,
  },

  // ── T3: Curva do Sol — frenagem leve + trail longo à esquerda ──
  {
    id: 'ilg_t3_curva_sol',
    name: 'Curva 3 — Curva do Sol',
    desc: 'Curva de média velocidade à esquerda. Frenagem leve e trail braking longo.',
    icon: '☀️',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T3',
    curves: {
      brake: t => {
        if (t < 0.06) return t / 0.06 * 0.6;
        if (t < 0.15) return 0.6;
        if (t < 0.5) return 0.6 - (t - 0.15) / 0.35 * 0.6;
        return 0;
      },
      steering: t => {
        if (t < 0.1) return 0.5;
        if (t < 0.35) return 0.5 - ((t - 0.1) / 0.25) * 0.3;
        if (t < 0.65) return 0.2;
        if (t < 0.9) return 0.2 + ((t - 0.65) / 0.25) * 0.3;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.45) return 0;
        if (t < 0.8) return Math.pow((t - 0.45) / 0.35, 1.1);
        return 1;
      },
    },
    duration: 4500, diff: 2,
  },

  // ── T7: Ferradura — curva longa de direita ──
  {
    id: 'ilg_t7_ferradura',
    name: 'Curva 7 — Ferradura',
    desc: 'Curva longa de direita. Frenagem média com esterço prolongado e saída paciente.',
    icon: '🧲',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T7',
    curves: {
      brake: t => {
        if (t < 0.05) return t / 0.05 * 0.75;
        if (t < 0.15) return 0.75;
        if (t < 0.4) return 0.75 - (t - 0.15) / 0.25 * 0.75;
        return 0;
      },
      steering: t => {
        if (t < 0.1) return 0.5;
        if (t < 0.3) return 0.5 + ((t - 0.1) / 0.2) * 0.35;
        if (t < 0.7) return 0.85;
        if (t < 0.9) return 0.85 - ((t - 0.7) / 0.2) * 0.35;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.35) return 0;
        if (t < 0.6) return Math.pow((t - 0.35) / 0.25, 0.9) * 0.5;
        if (t < 0.85) return 0.5 + ((t - 0.6) / 0.25) * 0.5;
        return 1;
      },
    },
    duration: 5500, diff: 3,
  },

  // ── T11: Bico de Pato — frenagem forte + trail curto ──
  {
    id: 'ilg_t11_bico_pato',
    name: 'Curva 11 — Bico de Pato',
    desc: 'Frenagem forte com trail curto. Curva rápida de esquerda na subida.',
    icon: '🦆',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T11',
    curves: {
      brake: t => {
        if (t < 0.05) return t / 0.05;
        if (t < 0.2) return 1;
        if (t < 0.4) return 1 - (t - 0.2) / 0.2;
        return 0;
      },
      steering: t => {
        if (t < 0.12) return 0.5;
        if (t < 0.3) return 0.5 - ((t - 0.12) / 0.18) * 0.3;
        if (t < 0.6) return 0.2;
        if (t < 0.8) return 0.2 + ((t - 0.6) / 0.2) * 0.3;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.4) return 0;
        if (t < 0.7) return Math.pow((t - 0.4) / 0.3, 1.2);
        return 1;
      },
    },
    duration: 4500, diff: 3,
  },

  // ── Subida dos Boxes (T13→reta) — aceleração máxima na subida ──
  {
    id: 'ilg_t13_subida_boxes',
    name: 'Subida dos Boxes',
    desc: 'Após a Junção, aceleração máxima na subida para a reta dos boxes. Foco total no acelerador.',
    icon: '⬆️',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'T13',
    curves: {
      steering: t => {
        if (t < 0.1) return 0.3;
        if (t < 0.4) return 0.3 + ((t - 0.1) / 0.3) * 0.2;
        return 0.5;
      },
      throttle: t => {
        if (t < 0.05) return 0.6;
        if (t < 0.3) return 0.6 + ((t - 0.05) / 0.25) * 0.4;
        return 1;
      },
    },
    duration: 3000, diff: 1,
  },

  // ═══════════════════════════════════════════
  // MEIA VOLTA e VOLTA COMPLETA (exercícios únicos)
  // ═══════════════════════════════════════════

  // Helper: each segment = { start, end } as fraction of total time
  // Segments: T1(.00-.12) reta(.12-.15) T3(.15-.24) reta(.24-.28) T4(.28-.38) reta(.38-.42) T6(.42-.50) T8(.50-.62)

  {
    id: 'ilg_half_lap',
    name: 'Meia Volta — Interlagos',
    desc: 'Setores 1 e 2 em sequência: Senna S → Curva do Sol → Descida do Lago → Laranjinha → Pinheirinho.',
    icon: '🏁',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'HALF',
    curves: {
      brake: t => {
        // T1 Senna S (0.00-0.14): ataque + trail
        if (t < 0.02) return t / 0.02;
        if (t < 0.05) return 1;
        if (t < 0.12) return 1 - (t - 0.05) / 0.07;
        // Reta (0.12-0.18): sem freio
        if (t < 0.18) return 0;
        // T3 Curva do Sol (0.18-0.28): frenagem leve
        if (t < 0.20) return (t - 0.18) / 0.02 * 0.6;
        if (t < 0.23) return 0.6;
        if (t < 0.28) return 0.6 - (t - 0.23) / 0.05 * 0.6;
        // Reta (0.28-0.34): sem freio
        if (t < 0.34) return 0;
        // T4 Descida do Lago (0.34-0.46): frenagem em descida
        if (t < 0.36) return (t - 0.34) / 0.02 * 0.85;
        if (t < 0.39) return 0.85;
        if (t < 0.46) return 0.85 - (t - 0.39) / 0.07 * 0.85;
        // Reta (0.46-0.52): sem freio
        if (t < 0.52) return 0;
        // T6 Laranjinha (0.52-0.62): SEM FREIO
        if (t < 0.62) return 0;
        // Reta curta (0.62-0.66)
        if (t < 0.66) return 0;
        // T8 Pinheirinho (0.66-0.82): frenagem forte + trail
        if (t < 0.68) return (t - 0.66) / 0.02;
        if (t < 0.73) return 1;
        if (t < 0.80) return 1 - (t - 0.73) / 0.07 * 0.8;
        if (t < 0.82) return 0.2 - (t - 0.80) / 0.02 * 0.2;
        return 0;
      },
      steering: t => {
        // T1: esquerda
        if (t < 0.03) return 0.5;
        if (t < 0.06) return 0.5 - (t - 0.03) / 0.03 * 0.3;
        if (t < 0.10) return 0.2;
        if (t < 0.12) return 0.2 + (t - 0.10) / 0.02 * 0.3;
        // Reta
        if (t < 0.18) return 0.5;
        // T3: esquerda
        if (t < 0.20) return 0.5;
        if (t < 0.23) return 0.5 - (t - 0.20) / 0.03 * 0.25;
        if (t < 0.26) return 0.25;
        if (t < 0.28) return 0.25 + (t - 0.26) / 0.02 * 0.25;
        // Reta
        if (t < 0.34) return 0.5;
        // T4: esquerda
        if (t < 0.37) return 0.5 - (t - 0.34) / 0.03 * 0.25;
        if (t < 0.43) return 0.25;
        if (t < 0.46) return 0.25 + (t - 0.43) / 0.03 * 0.25;
        // Reta
        if (t < 0.52) return 0.5;
        // T6 Laranjinha: esquerda suave
        if (t < 0.55) return 0.5 - (t - 0.52) / 0.03 * 0.2;
        if (t < 0.60) return 0.3;
        if (t < 0.62) return 0.3 + (t - 0.60) / 0.02 * 0.2;
        // Reta
        if (t < 0.66) return 0.5;
        // T8 Pinheirinho: esquerda forte
        if (t < 0.70) return 0.5 - (t - 0.66) / 0.04 * 0.4;
        if (t < 0.78) return 0.1;
        if (t < 0.82) return 0.1 + (t - 0.78) / 0.04 * 0.4;
        return 0.5;
      },
      throttle: t => {
        // T1: sem gás, depois progressivo
        if (t < 0.08) return 0;
        if (t < 0.12) return (t - 0.08) / 0.04 * 0.8;
        // Reta: full gas
        if (t < 0.18) return 1;
        // T3: sem gás, depois retoma
        if (t < 0.24) return 0;
        if (t < 0.28) return (t - 0.24) / 0.04;
        // Reta: full gas
        if (t < 0.34) return 1;
        // T4: sem gás, retoma
        if (t < 0.42) return 0;
        if (t < 0.46) return (t - 0.42) / 0.04;
        // Reta
        if (t < 0.52) return 1;
        // T6: lift + feathering
        if (t < 0.54) return 1 - (t - 0.52) / 0.02 * 0.6;
        if (t < 0.58) return 0.4;
        if (t < 0.62) return 0.4 + (t - 0.58) / 0.04 * 0.6;
        // Reta
        if (t < 0.66) return 1;
        // T8: sem gás, saída lenta
        if (t < 0.76) return 0;
        if (t < 0.82) return (t - 0.76) / 0.06 * 0.6;
        // Saída
        if (t < 0.90) return 0.6 + (t - 0.82) / 0.08 * 0.4;
        return 1;
      },
    },
    duration: 25000, diff: 3,
  },

  {
    id: 'ilg_full_lap',
    name: 'Volta Completa — Interlagos',
    desc: 'Todos os setores: S do Senna → Sol → Descida → Laranjinha → Ferradura → Pinheirinho → Mergulho → Bico de Pato → Junção.',
    icon: '🏆',
    pedal: 'combined',
    track: 'interlagos',
    corner: 'FULL',
    curves: {
      brake: t => {
        // S1: T1(0-0.08) reta(0.08-0.11) T3(0.11-0.17) reta(0.17-0.20) T4(0.20-0.28)
        // S2: reta(0.28-0.32) T6(0.32-0.38) T7(0.38-0.46) T8(0.46-0.56)
        // S3: reta(0.56-0.60) T10(0.60-0.70) T11(0.70-0.78) T12(0.78-0.88) T13(0.88-0.94)
        // T1
        if (t < 0.01) return t / 0.01;
        if (t < 0.03) return 1;
        if (t < 0.07) return 1 - (t - 0.03) / 0.04;
        if (t < 0.11) return 0; // reta
        // T3
        if (t < 0.12) return (t - 0.11) / 0.01 * 0.6;
        if (t < 0.14) return 0.6;
        if (t < 0.17) return 0.6 - (t - 0.14) / 0.03 * 0.6;
        if (t < 0.20) return 0; // reta
        // T4
        if (t < 0.21) return (t - 0.20) / 0.01 * 0.85;
        if (t < 0.24) return 0.85;
        if (t < 0.28) return 0.85 - (t - 0.24) / 0.04 * 0.85;
        if (t < 0.32) return 0; // reta
        // T6 sem freio
        if (t < 0.38) return 0;
        // T7 Ferradura
        if (t < 0.39) return (t - 0.38) / 0.01 * 0.75;
        if (t < 0.41) return 0.75;
        if (t < 0.46) return 0.75 - (t - 0.41) / 0.05 * 0.75;
        // T8 Pinheirinho
        if (t < 0.47) return (t - 0.46) / 0.01;
        if (t < 0.50) return 1;
        if (t < 0.55) return 1 - (t - 0.50) / 0.05 * 0.8;
        if (t < 0.56) return 0.2 - (t - 0.55) / 0.01 * 0.2;
        if (t < 0.60) return 0; // reta
        // T10 Mergulho
        if (t < 0.62) return (t - 0.60) / 0.02 * 0.7;
        if (t < 0.65) return 0.7 + (t - 0.62) / 0.03 * 0.3;
        if (t < 0.67) return 1;
        if (t < 0.70) return 1 - (t - 0.67) / 0.03;
        // T11 Bico de Pato
        if (t < 0.71) return (t - 0.70) / 0.01;
        if (t < 0.74) return 1;
        if (t < 0.78) return 1 - (t - 0.74) / 0.04;
        // T12 Junção
        if (t < 0.79) return (t - 0.78) / 0.01 * 0.9;
        if (t < 0.82) return 0.9;
        if (t < 0.86) return 0.9 - (t - 0.82) / 0.04 * 0.9;
        return 0;
      },
      steering: t => {
        // T1 esquerda
        if (t < 0.02) return 0.5;
        if (t < 0.04) return 0.5 - (t - 0.02) / 0.02 * 0.3;
        if (t < 0.06) return 0.2;
        if (t < 0.08) return 0.2 + (t - 0.06) / 0.02 * 0.3;
        if (t < 0.11) return 0.5;
        // T3 esquerda
        if (t < 0.13) return 0.5 - (t - 0.11) / 0.02 * 0.25;
        if (t < 0.16) return 0.25;
        if (t < 0.17) return 0.25 + (t - 0.16) / 0.01 * 0.25;
        if (t < 0.20) return 0.5;
        // T4 esquerda
        if (t < 0.22) return 0.5 - (t - 0.20) / 0.02 * 0.25;
        if (t < 0.26) return 0.25;
        if (t < 0.28) return 0.25 + (t - 0.26) / 0.02 * 0.25;
        if (t < 0.32) return 0.5;
        // T6 esquerda suave
        if (t < 0.34) return 0.5 - (t - 0.32) / 0.02 * 0.15;
        if (t < 0.37) return 0.35;
        if (t < 0.38) return 0.35 + (t - 0.37) / 0.01 * 0.15;
        // T7 Ferradura direita
        if (t < 0.40) return 0.5 + (t - 0.38) / 0.02 * 0.3;
        if (t < 0.44) return 0.8;
        if (t < 0.46) return 0.8 - (t - 0.44) / 0.02 * 0.3;
        // T8 Pinheirinho esquerda forte
        if (t < 0.48) return 0.5;
        if (t < 0.50) return 0.5 - (t - 0.48) / 0.02 * 0.4;
        if (t < 0.54) return 0.1;
        if (t < 0.56) return 0.1 + (t - 0.54) / 0.02 * 0.4;
        if (t < 0.60) return 0.5;
        // T10 Mergulho esquerda
        if (t < 0.63) return 0.5 - (t - 0.60) / 0.03 * 0.25;
        if (t < 0.68) return 0.25;
        if (t < 0.70) return 0.25 + (t - 0.68) / 0.02 * 0.25;
        // T11 esquerda
        if (t < 0.72) return 0.5 - (t - 0.70) / 0.02 * 0.25;
        if (t < 0.76) return 0.25;
        if (t < 0.78) return 0.25 + (t - 0.76) / 0.02 * 0.25;
        // T12 Junção esquerda
        if (t < 0.80) return 0.5 - (t - 0.78) / 0.02 * 0.25;
        if (t < 0.85) return 0.25;
        if (t < 0.88) return 0.25 + (t - 0.85) / 0.03 * 0.25;
        return 0.5;
      },
      throttle: t => {
        // T1: sem gás → retoma
        if (t < 0.05) return 0;
        if (t < 0.08) return (t - 0.05) / 0.03;
        if (t < 0.11) return 1;
        // T3: corta → retoma
        if (t < 0.15) return 0;
        if (t < 0.17) return (t - 0.15) / 0.02;
        if (t < 0.20) return 1;
        // T4: corta → retoma
        if (t < 0.26) return 0;
        if (t < 0.28) return (t - 0.26) / 0.02;
        if (t < 0.32) return 1;
        // T6: lift + feathering
        if (t < 0.33) return 1 - (t - 0.32) / 0.01 * 0.6;
        if (t < 0.36) return 0.4;
        if (t < 0.38) return 0.4 + (t - 0.36) / 0.02 * 0.6;
        // T7: corta → retoma lenta
        if (t < 0.43) return 0;
        if (t < 0.46) return (t - 0.43) / 0.03 * 0.7;
        // T8: corta → saída lenta
        if (t < 0.52) return 0;
        if (t < 0.56) return (t - 0.52) / 0.04 * 0.6;
        if (t < 0.60) return 0.6 + (t - 0.56) / 0.04 * 0.4;
        // T10: corta → retoma
        if (t < 0.68) return 0;
        if (t < 0.70) return (t - 0.68) / 0.02;
        // T11: corta → retoma
        if (t < 0.76) return 0;
        if (t < 0.78) return (t - 0.76) / 0.02;
        // T12: corta → saída crucial
        if (t < 0.84) return 0;
        if (t < 0.88) return Math.pow((t - 0.84) / 0.04, 0.9) * 0.5;
        if (t < 0.94) return 0.5 + (t - 0.88) / 0.06 * 0.5;
        return 1;
      },
    },
    duration: 45000, diff: 3,
  },
];

// Tutorials for Interlagos scenarios
export const INTERLAGOS_TUTORIALS = {
  ilg_t1_senna_s: {
    title: 'Curva 1 — Senna S',
    paragraphs: [
      'A curva mais icônica de Interlagos. Frenagem forte no final da reta dos boxes, com trail braking longo na entrada à esquerda.',
      'O segredo é soltar o freio gradualmente enquanto esterça. Se frear demais na curva, trava a dianteira. Se soltar rápido demais, sai de traseira.',
    ],
    diagram: 'full_corner',
    tips: ['Frenagem forte mas curta — ataque rápido', 'Trail braking longo: freio vai saindo enquanto volante entra', 'Acelerador só quando o volante começa a desfazer'],
  },
  ilg_t2_senna_s2: {
    title: 'Curva 2 — Senna S (saída)',
    paragraphs: [
      'A segunda parte do S do Senna. Transição rápida do esterço da esquerda para a direita.',
      'O acelerador precisa ser dosado na transição — gás parcial entre as curvas e full gas na saída.',
    ],
    diagram: 'chicane',
    tips: ['Transição de volante fluida — não hesite', 'Gás parcial entre os lados', 'Full gas só quando o volante endireitar na saída'],
  },
  ilg_t3_curva_sol: {
    title: 'Curva 3 — Curva do Sol',
    paragraphs: [
      'Curva de média velocidade à esquerda após o S do Senna. Frenagem mais leve que a T1.',
      'O trail braking é longo e gradual. A saída é importante para velocidade na reta oposta.',
    ],
    diagram: 'trail',
    tips: ['Frenagem leve — não pise a fundo', 'Trail longo e suave', 'Boa saída aqui = velocidade na reta oposta'],
  },
  ilg_t4_descida_lago: {
    title: 'Curva 4 — Descida do Lago',
    paragraphs: [
      'Frenagem em descida forte. A transferência de peso muda completamente — o freio precisa ser mais modulado.',
      'Evite travar as rodas na descida. Use menos pressão inicial e construa gradualmente.',
    ],
    diagram: 'progressive',
    tips: ['Na descida, ataque mais suave', 'Pressão máxima ~85%, não 100%', 'Trail braking standard na saída'],
  },
  ilg_t6_laranjinha: {
    title: 'Curva 6 — Laranjinha',
    paragraphs: [
      'Curva rápida de esquerda feita sem freio! Apenas lift do acelerador e feathering.',
      'É uma curva de comprometimento — entre com confiança e mantenha gás parcial no apex.',
    ],
    diagram: 'feathering',
    tips: ['SEM FREIO — apenas tire o pé do gás', 'Feathering no apex (~35%)', 'Aceleração progressiva na saída'],
  },
  ilg_t7_ferradura: {
    title: 'Curva 7 — Ferradura',
    paragraphs: [
      'Curva longa de direita que exige paciência. Esterço prolongado com aceleração gradual.',
      'O erro comum é acelerar cedo demais e sair da pista na saída.',
    ],
    diagram: 'full_corner',
    tips: ['Frenagem média e curta', 'Mantenha o esterço por bastante tempo', 'Aceleração só quando sentir o carro "apoiar"'],
  },
  ilg_t8_pinheirinho: {
    title: 'Curva 8 — Pinheirinho',
    paragraphs: [
      'Hairpin lento que exige paciência. Frenagem forte, esterço máximo, e saída controlada.',
      'O erro mais comum é acelerar cedo demais na saída. Espere o carro apontar para a reta antes de pisar no gás.',
    ],
    diagram: 'full_corner',
    tips: ['Freie forte e mantenha o threshold', 'Esterço quase total à esquerda', 'Saída com calma — acelerador progressivo só quando endireitar'],
  },
  ilg_t10_mergulho: {
    title: 'Curva 10 — Mergulho',
    paragraphs: [
      'A descida mais íngreme do circuito. A transferência de peso muda completamente na descida — o freio precisa ser mais modulado.',
      'Construa a pressão de freio gradualmente, não ataque de uma vez como numa reta plana.',
    ],
    diagram: 'progressive',
    tips: ['Na descida, ataque gradual — não stab', 'Build up: comece em ~70% e suba para 100%', 'Trail braking standard na saída'],
  },
  ilg_t11_bico_pato: {
    title: 'Curva 11 — Bico de Pato',
    paragraphs: [
      'Frenagem forte na subida para curva rápida de esquerda. Trail curto.',
      'Como está em subida, o carro tem mais grip na frenagem. Pode atacar mais agressivamente.',
    ],
    diagram: 'trail',
    tips: ['Ataque forte — subida dá mais grip', 'Trail curto — solte rápido', 'Aceleração progressiva na saída'],
  },
  ilg_t12_juncao: {
    title: 'Curva 12 — Junção',
    paragraphs: [
      'A curva mais importante do circuito. Uma boa saída aqui significa velocidade máxima na reta dos boxes — e tempo de volta rápido.',
      'O trail braking é curto. O foco é na aceleração: comece leve e construa até 100% conforme o volante desfaz.',
    ],
    diagram: 'trail_throttle',
    tips: ['Frenagem curta e eficiente', 'Aceleração progressiva — nunca de golpe', 'Cada 1% a mais de acelerador na saída = tempo na reta'],
  },
  ilg_pit_entry: {
    title: 'Entrada de Boxes',
    paragraphs: [
      'Desacelere de forma controlada para entrar no pit lane. Respeite o limite de velocidade!',
      'Freio moderado e constante, desvio para a direita suave.',
    ],
    diagram: 'progressive',
    tips: ['Freio moderado — não trave', 'Desvio suave para a direita', 'Sem acelerador no pit lane'],
  },
  ilg_pit_exit: {
    title: 'Saída de Boxes',
    paragraphs: [
      'Saia do pit lane respeitando o limite até a linha de saída. Depois, acelere progressivamente.',
      'O merge com a pista deve ser suave — esterço leve para a esquerda e aceleração gradual.',
    ],
    diagram: 'smooth_exit',
    tips: ['Velocidade controlada (~30%) no pit lane', 'Após a linha, aceleração progressiva', 'Merge suave — não entre na pista de golpe'],
  },
  ilg_t13_subida_boxes: {
    title: 'Subida dos Boxes',
    paragraphs: [
      'Após a Junção, a subida em direção à reta dos boxes. Foco total em aceleração máxima.',
      'Endireite o volante progressivamente enquanto sobe o acelerador a 100%.',
    ],
    diagram: 'smooth_exit',
    tips: ['Volante vai endireitando', 'Acelerador a fundo o mais rápido possível', 'Exercício de saída pura — velocidade na reta depende disso'],
  },
  ilg_half_lap: {
    title: 'Meia Volta — Interlagos',
    paragraphs: [
      'Setores 1 e 2 de Interlagos em sequência contínua: Senna S → Curva do Sol → Descida do Lago → Laranjinha → Pinheirinho.',
      'São 25 segundos ininterruptos. O ritmo é tudo — cada curva conecta naturalmente na próxima. Nas retas entre curvas, acelere a fundo.',
    ],
    diagram: 'full_corner',
    tips: ['Cada curva é separada por uma breve reta a fundo', 'Mantenha o ritmo — não pense em cada curva isolada', 'A Laranjinha é SEM FREIO — apenas tire o pé do gás'],
  },
  ilg_full_lap: {
    title: 'Volta Completa — Interlagos',
    paragraphs: [
      'A volta inteira do Autódromo José Carlos Pace: 9 curvas, 45 segundos de concentração total.',
      'É o teste supremo. Freio, volante e acelerador em sequência ininterrupta. Dominar isso é dominar Interlagos.',
    ],
    diagram: 'full_corner',
    tips: ['45 segundos de foco absoluto', 'Cada reta é para recuperar — gás a fundo e respirar', 'A Junção no final é a mais importante — concentre-se na saída'],
  },
};
