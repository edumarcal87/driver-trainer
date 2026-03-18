/**
 * Training Programs — structured progression paths for sim racers.
 * Order: Novato → Iniciante → Intermediário → Avançado → Utilitários
 */

export const PROGRAMS = [
  // ═══════════════════════════════════════════
  // NOVATO
  // ═══════════════════════════════════════════
  {
    id: 'prog_first_laps',
    name: 'Primeiras Voltas',
    desc: 'Nunca usou pedais? Comece aqui. Aprenda a dosar freio e acelerador do zero.',
    icon: '🟡',
    color: '#f39c12',
    level: 'Novato',
    weeks: [
      {
        title: 'Semana 1 — Conhecendo os pedais',
        sessions: [
          { title: 'Freio reto', exercises: ['b_threshold', 'b_threshold'], minScore: 35, desc: 'Só pisar e soltar — sem complicação' },
          { title: 'Acelerador suave', exercises: ['t_smooth_exit', 't_smooth_exit'], minScore: 35, desc: 'Acelere devagar até o máximo' },
          { title: 'Freio + acel', exercises: ['b_threshold', 't_smooth_exit', 'b_stab'], minScore: 40, desc: 'Alterne entre os dois pedais' },
        ]
      },
      {
        title: 'Semana 2 — Ganhando confiança',
        sessions: [
          { title: 'Freios variados', exercises: ['b_stab', 'b_progressive', 'b_threshold'], minScore: 40, desc: 'Três estilos de frenagem' },
          { title: 'Volante básico', exercises: ['s_smooth_turn_r', 's_smooth_turn_l'], minScore: 35, desc: 'Curvas suaves para cada lado' },
          { title: 'Tudo junto', exercises: ['b_threshold', 't_smooth_exit', 's_smooth_turn_r'], minScore: 40, desc: 'Freio, gás e volante separados' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════
  // INICIANTE
  // ═══════════════════════════════════════════
  {
    id: 'prog_brake_fundamentals',
    name: 'Fundamentos de Frenagem',
    desc: 'Domine os 4 tipos de frenagem essenciais. Da freada reta até o trail braking avançado.',
    icon: '🔴',
    color: '#e74c3c',
    level: 'Iniciante',
    weeks: [
      {
        title: 'Semana 1 — Frenagem básica',
        sessions: [
          { title: 'Freio reto', exercises: ['b_threshold', 'b_threshold', 'b_stab'], minScore: 50, desc: 'Aprenda a dosagem básica do freio' },
          { title: 'Progressão', exercises: ['b_progressive', 'b_progressive', 'b_threshold'], minScore: 55, desc: 'Construa pressão gradualmente' },
          { title: 'Teste', exercises: ['b_threshold', 'b_stab', 'b_progressive'], minScore: 60, desc: 'Combine os 3 tipos aprendidos' },
        ]
      },
      {
        title: 'Semana 2 — Trail braking',
        sessions: [
          { title: 'Introdução ao trail', exercises: ['b_trail', 'b_trail', 'b_trail'], minScore: 45, desc: 'A técnica mais importante do sim racing' },
          { title: 'Trail + threshold', exercises: ['b_threshold', 'b_trail', 'b_trail'], minScore: 50, desc: 'Alterne entre frenagem reta e trail' },
          { title: 'Consistência', exercises: ['b_trail', 'b_progressive', 'b_trail'], minScore: 55, desc: 'Mantenha precisão ao longo dos exercícios' },
        ]
      },
      {
        title: 'Semana 3 — Técnicas avançadas',
        sessions: [
          { title: 'Frenagem tardia', exercises: ['b_late_trail', 'b_late_trail', 'b_trail'], minScore: 45, desc: 'Freio tardio com modulação precisa' },
          { title: 'Double tap', exercises: ['b_double', 'b_stab', 'b_double'], minScore: 50, desc: 'Duas frenagens em sequência rápida' },
          { title: 'Mix avançado', exercises: ['b_late_trail', 'b_double', 'b_trail'], minScore: 55, desc: 'Todas as técnicas combinadas' },
        ]
      },
      {
        title: 'Semana 4 — Prova final',
        sessions: [
          { title: 'Revisão geral', exercises: ['b_threshold', 'b_trail', 'b_progressive', 'b_stab'], minScore: 60, desc: 'Revisão de todos os fundamentos' },
          { title: 'Desafio final', exercises: ['b_trail', 'b_late_trail', 'b_double', 'b_trail'], minScore: 65, desc: 'Prove que domina a frenagem' },
        ]
      },
    ]
  },
  {
    id: 'prog_throttle_control',
    name: 'Controle de Acelerador',
    desc: 'Aprenda a dosar o acelerador na saída de curva, feathering e correções.',
    icon: '🟢',
    color: '#27ae60',
    level: 'Iniciante',
    weeks: [
      {
        title: 'Semana 1 — Saídas de curva',
        sessions: [
          { title: 'Saída progressiva', exercises: ['t_smooth_exit', 't_smooth_exit', 't_smooth_exit'], minScore: 50, desc: 'O básico: aceleração gradual' },
          { title: 'Saída agressiva', exercises: ['t_aggressive_exit', 't_smooth_exit', 't_aggressive_exit'], minScore: 50, desc: 'Pós-apex com mais intensidade' },
        ]
      },
      {
        title: 'Semana 2 — Modulação fina',
        sessions: [
          { title: 'Feathering', exercises: ['t_feathering', 't_feathering', 't_smooth_exit'], minScore: 40, desc: 'Modulação delicada em curva' },
          { title: 'Lift & coast', exercises: ['t_lift_reapply', 't_lift_reapply', 't_feathering'], minScore: 45, desc: 'Levantar e reaplicar com precisão' },
          { title: 'Domínio completo', exercises: ['t_smooth_exit', 't_feathering', 't_lift_reapply', 't_aggressive_exit'], minScore: 50, desc: 'Todos os padrões combinados' },
        ]
      },
    ]
  },
  {
    id: 'prog_steering_precision',
    name: 'Precisão de Volante',
    desc: 'Desenvolva mãos suaves e precisas. De curvas básicas até recuperação de traseirada.',
    icon: '🔵',
    color: '#2980b9',
    level: 'Iniciante',
    weeks: [
      {
        title: 'Semana 1 — Curvas básicas',
        sessions: [
          { title: 'Curvas suaves', exercises: ['s_smooth_turn_r', 's_smooth_turn_l', 's_smooth_turn_r'], minScore: 50, desc: 'Entrada e saída progressiva' },
          { title: 'Correções', exercises: ['s_correction', 's_correction', 's_smooth_turn_l'], minScore: 50, desc: 'Micro-ajustes em reta' },
        ]
      },
      {
        title: 'Semana 2 — Movimentos complexos',
        sessions: [
          { title: 'Chicane', exercises: ['s_chicane', 's_chicane', 's_slalom'], minScore: 45, desc: 'Troca rápida de direção' },
          { title: 'Hairpin', exercises: ['s_hairpin', 's_hairpin', 's_smooth_turn_r'], minScore: 45, desc: 'Curva de baixa velocidade com esterço máximo' },
          { title: 'Recuperação', exercises: ['s_oversteer_recovery', 's_oversteer_recovery', 's_chicane'], minScore: 40, desc: 'Contra-esterço para salvar a traseira' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════
  // INTERMEDIÁRIO
  // ═══════════════════════════════════════════
  {
    id: 'prog_race_ready',
    name: 'Pronto para Corrida',
    desc: 'Combinações reais de pedais e volante. Heel-toe, trail→acel, largadas e curvas completas.',
    icon: '🏎️',
    color: '#8e44ad',
    level: 'Intermediário',
    weeks: [
      {
        title: 'Semana 1 — Transições básicas',
        sessions: [
          { title: 'Trail → aceleração', exercises: ['b_trail', 'x_trail_throttle', 'x_trail_throttle'], minScore: 45, desc: 'A transição mais importante: freio → gás' },
          { title: 'Largada', exercises: ['x_launch_start', 'x_launch_start', 't_aggressive_exit'], minScore: 45, desc: 'Embreagem + acelerador na largada' },
        ]
      },
      {
        title: 'Semana 2 — Curvas com freio',
        sessions: [
          { title: 'Frenagem + esterço', exercises: ['b_trail', 'x_brake_steer', 'x_brake_steer'], minScore: 40, desc: 'Trail brake enquanto vira o volante' },
          { title: 'Saída de curva', exercises: ['x_corner_exit', 'x_corner_exit', 'x_trail_throttle'], minScore: 45, desc: 'Endireitar + acelerar coordenado' },
        ]
      },
      {
        title: 'Semana 3 — Heel-toe e reduções',
        sessions: [
          { title: 'Reduções', exercises: ['x_downshift_sequence', 'x_downshift_sequence', 'c_quick_shift'], minScore: 40, desc: 'Freio + embreagem para reduções' },
          { title: 'Heel-toe', exercises: ['c_heel_toe', 'x_heel_toe', 'x_heel_toe'], minScore: 40, desc: 'A técnica definitiva: 3 pedais simultâneos' },
        ]
      },
      {
        title: 'Semana 4 — Curva completa',
        sessions: [
          { title: 'Chicane', exercises: ['x_chicane_throttle', 'x_chicane_throttle', 's_chicane'], minScore: 45, desc: 'Sequência esquerda-direita com acelerador' },
          { title: 'A curva perfeita', exercises: ['x_full_corner', 'x_full_corner', 'x_full_corner'], minScore: 50, desc: 'Freio + volante + acelerador — o teste final' },
        ]
      },
    ]
  },
  {
    id: 'prog_consistency_master',
    name: 'Mestre da Consistência',
    desc: 'Repetição gera consistência. Cada sessão exige notas altas — sem margem para erro.',
    icon: '🎯',
    color: '#e67e22',
    level: 'Intermediário',
    weeks: [
      {
        title: 'Semana 1 — Freio consistente',
        sessions: [
          { title: 'Threshold perfeito', exercises: ['b_threshold', 'b_threshold', 'b_threshold'], minScore: 75, desc: 'Três tentativas, todas acima de 75%' },
          { title: 'Trail perfeito', exercises: ['b_trail', 'b_trail', 'b_trail'], minScore: 70, desc: 'Consistência no trail braking' },
        ]
      },
      {
        title: 'Semana 2 — Acelerador e volante',
        sessions: [
          { title: 'Saída precisa', exercises: ['t_smooth_exit', 't_smooth_exit', 't_aggressive_exit'], minScore: 70, desc: 'Saídas de curva sem erro' },
          { title: 'Volante preciso', exercises: ['s_smooth_turn_r', 's_chicane', 's_smooth_turn_l'], minScore: 65, desc: 'Mãos firmes e suaves' },
        ]
      },
      {
        title: 'Semana 3 — Combinados sob pressão',
        sessions: [
          { title: 'Trail → acel', exercises: ['x_trail_throttle', 'x_trail_throttle', 'x_trail_throttle'], minScore: 65, desc: 'A transição mais importante, 3x' },
          { title: 'Curva completa', exercises: ['x_brake_steer', 'x_corner_exit', 'x_full_corner'], minScore: 60, desc: 'Prove que é consistente no combinado' },
        ]
      },
    ]
  },
  {
    id: 'prog_wet_conditions',
    name: 'Pilotagem na Chuva',
    desc: 'Inputs suaves e progressivos. Treine a delicadeza necessária para pista molhada.',
    icon: '🌧️',
    color: '#5dade2',
    level: 'Intermediário',
    weeks: [
      {
        title: 'Semana 1 — Suavidade total',
        sessions: [
          { title: 'Freio progressivo', exercises: ['b_progressive', 'b_progressive', 'b_progressive'], minScore: 60, desc: 'Nada de stab — construa pressão lentamente' },
          { title: 'Aceleração controlada', exercises: ['t_smooth_exit', 't_feathering', 't_smooth_exit'], minScore: 55, desc: 'Feathering é a chave na chuva' },
          { title: 'Volante suave', exercises: ['s_smooth_turn_r', 's_smooth_turn_l', 's_correction'], minScore: 55, desc: 'Movimentos lentos e precisos' },
        ]
      },
      {
        title: 'Semana 2 — Combinados delicados',
        sessions: [
          { title: 'Trail suave', exercises: ['b_trail', 'x_trail_throttle', 'x_trail_throttle'], minScore: 50, desc: 'Trail braking sem travar as rodas' },
          { title: 'Saída cuidadosa', exercises: ['x_corner_exit', 'x_corner_exit', 't_feathering'], minScore: 50, desc: 'Saia da curva sem escorregar' },
          { title: 'Volta na chuva', exercises: ['x_brake_steer', 'x_corner_exit', 'x_full_corner'], minScore: 45, desc: 'Tudo delicado — como na chuva real' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════
  // AVANÇADO
  // ═══════════════════════════════════════════
  {
    id: 'prog_advanced_techniques',
    name: 'Técnicas Avançadas',
    desc: 'Heel-toe, left-foot braking, correções e recuperação. Para quem já domina o básico.',
    icon: '⚡',
    color: '#9b59b6',
    level: 'Avançado',
    weeks: [
      {
        title: 'Semana 1 — Embreagem avançada',
        sessions: [
          { title: 'Trocas rápidas', exercises: ['c_quick_shift', 'c_quick_shift', 'c_quick_shift'], minScore: 60, desc: 'Velocidade e precisão na embreagem' },
          { title: 'Heel-toe prep', exercises: ['c_heel_toe', 'c_heel_toe', 'c_launch'], minScore: 55, desc: 'Prepare-se para o heel-toe completo' },
        ]
      },
      {
        title: 'Semana 2 — Heel-toe e reduções',
        sessions: [
          { title: 'Reduções sequenciais', exercises: ['x_downshift_sequence', 'x_downshift_sequence', 'c_quick_shift'], minScore: 50, desc: 'Freio constante + embreagem precisa' },
          { title: 'Heel-toe completo', exercises: ['x_heel_toe', 'x_heel_toe', 'x_heel_toe'], minScore: 50, desc: '3 pedais simultâneos — o teste supremo' },
        ]
      },
      {
        title: 'Semana 3 — Correções e recuperação',
        sessions: [
          { title: 'Micro-correções', exercises: ['s_correction', 's_correction', 's_slalom'], minScore: 55, desc: 'Ajustes finos de trajetória' },
          { title: 'Recuperar traseirada', exercises: ['s_oversteer_recovery', 's_oversteer_recovery', 's_chicane'], minScore: 50, desc: 'Contra-esterço rápido e preciso' },
          { title: 'Sob pressão', exercises: ['x_heel_toe', 'x_chicane_throttle', 'x_full_corner'], minScore: 55, desc: 'Tudo junto — nível piloto' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════
  // CÂMBIO
  // ═══════════════════════════════════════════
  {
    id: 'prog_sequential_shifting',
    name: 'Câmbio Sequencial',
    desc: 'Domine as borboletas. Timing de troca, reduções com freio e largadas com paddle shifter.',
    icon: '🏎️',
    color: '#e67e22',
    level: 'Iniciante',
    weeks: [
      {
        title: 'Semana 1 — Fundamentos',
        sessions: [
          { title: 'Subir marchas', exercises: ['seq_upshift_basic', 'seq_upshift_basic'], minScore: 45, desc: 'De 1ª a 6ª com timing de acelerador' },
          { title: 'Descer marchas', exercises: ['seq_downshift_basic', 'seq_downshift_basic'], minScore: 45, desc: 'De 6ª a 2ª com freio' },
          { title: 'Trocas rápidas', exercises: ['seq_quick_shifts', 'seq_quick_shifts'], minScore: 40, desc: 'Sobe e desce — teste de reflexo' },
        ]
      },
      {
        title: 'Semana 2 — Aplicação em corrida',
        sessions: [
          { title: 'Largada', exercises: ['seq_race_start', 'seq_race_start'], minScore: 45, desc: 'Largada com aceleração máxima entre trocas' },
          { title: 'Frenagem com reduções', exercises: ['seq_braking_downshift', 'seq_braking_downshift'], minScore: 40, desc: 'Freio + redução + rev matching' },
          { title: 'Simulação completa', exercises: ['seq_race_start', 'seq_braking_downshift', 'seq_quick_shifts'], minScore: 42, desc: 'Todos os padrões em sequência' },
        ]
      },
    ]
  },
  {
    id: 'prog_hpattern_shifting',
    name: 'Câmbio H-Pattern',
    desc: 'Domine o câmbio manual com embreagem. Da troca básica ao heel-toe com H-shifter.',
    icon: '🔧',
    color: '#d35400',
    level: 'Intermediário',
    weeks: [
      {
        title: 'Semana 1 — Coordenação básica',
        sessions: [
          { title: 'Subir com embreagem', exercises: ['hpat_upshift_basic', 'hpat_upshift_basic'], minScore: 40, desc: 'H-shifter + embreagem coordenados' },
          { title: 'Largada manual', exercises: ['hpat_race_start', 'hpat_race_start'], minScore: 40, desc: 'Largada com embreagem e câmbio H' },
        ]
      },
      {
        title: 'Semana 2 — Heel-toe com H-Pattern',
        sessions: [
          { title: 'Heel-toe reduções', exercises: ['hpat_downshift_heel_toe', 'hpat_downshift_heel_toe'], minScore: 35, desc: 'A técnica suprema: freio + embreagem + blip + câmbio' },
          { title: 'Domínio completo', exercises: ['hpat_upshift_basic', 'hpat_downshift_heel_toe', 'hpat_race_start'], minScore: 38, desc: 'Subir, descer e largar — tudo com H-pattern' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════
  // UTILITÁRIOS
  // ═══════════════════════════════════════════
  {
    id: 'prog_race_week',
    name: 'Semana de Corrida',
    desc: 'Aquecimento completo em 5 sessões curtas. Ideal antes de entrar no simulador.',
    icon: '🏁',
    color: '#27ae60',
    level: 'Todos',
    weeks: [
      {
        title: 'Aquecimento pré-corrida',
        sessions: [
          { title: 'Aquecer freio', exercises: ['b_threshold', 'b_trail'], minScore: 50, desc: 'Aqueça a frenagem' },
          { title: 'Aquecer acelerador', exercises: ['t_smooth_exit', 't_aggressive_exit'], minScore: 50, desc: 'Calibre a dosagem de gás' },
          { title: 'Aquecer volante', exercises: ['s_smooth_turn_r', 's_chicane'], minScore: 45, desc: 'Suavize as mãos' },
          { title: 'Aquecer câmbio', exercises: ['seq_upshift_basic', 'seq_downshift_basic'], minScore: 45, desc: 'Aqueça o timing de troca' },
          { title: 'Transições', exercises: ['x_trail_throttle', 'x_corner_exit'], minScore: 45, desc: 'Freio→gás, volante→gás' },
          { title: 'Simulação de volta', exercises: ['x_brake_steer', 'x_full_corner', 'x_trail_throttle'], minScore: 45, desc: 'Sequência de curva completa — pronto pra pista' },
        ]
      },
    ]
  },

  // ═══════════════════════════════════════════
  // CENÁRIOS DE PISTA
  // ═══════════════════════════════════════════
  {
    id: 'prog_interlagos',
    name: 'Interlagos — Volta Completa',
    desc: 'Treine cada curva do Autódromo José Carlos Pace. 12 cenários reais baseados em telemetria.',
    icon: '🇧🇷',
    color: '#009739',
    level: 'Pista Real',
    weeks: [
      {
        title: 'Setor 1 — Senna S, Curva do Sol e Descida',
        sessions: [
          { title: 'Senna S — Entrada', exercises: ['ilg_t1_senna_s', 'ilg_t1_senna_s'], minScore: 40, desc: 'Frenagem forte + trail na curva mais icônica' },
          { title: 'Senna S — Saída', exercises: ['ilg_t2_senna_s2', 'ilg_t2_senna_s2'], minScore: 40, desc: 'Transição rápida para a direita' },
          { title: 'Senna S Completo', exercises: ['ilg_t1_senna_s', 'ilg_t2_senna_s2'], minScore: 45, desc: 'As duas partes em sequência' },
          { title: 'Curva do Sol', exercises: ['ilg_t3_curva_sol', 'ilg_t3_curva_sol'], minScore: 40, desc: 'Frenagem leve + trail longo' },
          { title: 'Descida do Lago', exercises: ['ilg_t4_descida_lago', 'ilg_t4_descida_lago'], minScore: 40, desc: 'Frenagem em descida — suavidade' },
          { title: 'Setor 1 completo', exercises: ['ilg_t1_senna_s', 'ilg_t3_curva_sol', 'ilg_t4_descida_lago'], minScore: 40, desc: 'Senna S → Sol → Descida em sequência' },
        ]
      },
      {
        title: 'Setor 2 — Laranjinha, Ferradura e Pinheirinho',
        sessions: [
          { title: 'Laranjinha', exercises: ['ilg_t6_laranjinha', 'ilg_t6_laranjinha'], minScore: 45, desc: 'Curva rápida com feathering — sem freio!' },
          { title: 'Ferradura', exercises: ['ilg_t7_ferradura', 'ilg_t7_ferradura'], minScore: 40, desc: 'Curva longa de direita — paciência' },
          { title: 'Pinheirinho', exercises: ['ilg_t8_pinheirinho', 'ilg_t8_pinheirinho'], minScore: 40, desc: 'Hairpin — esterço máximo e saída paciente' },
          { title: 'Setor 2 completo', exercises: ['ilg_t6_laranjinha', 'ilg_t7_ferradura', 'ilg_t8_pinheirinho'], minScore: 40, desc: 'As três curvas do setor 2 em sequência' },
        ]
      },
      {
        title: 'Setor 3 — Mergulho, Bico de Pato e Junção',
        sessions: [
          { title: 'Mergulho', exercises: ['ilg_t10_mergulho', 'ilg_t10_mergulho'], minScore: 40, desc: 'A descida mais íngreme do circuito' },
          { title: 'Bico de Pato', exercises: ['ilg_t11_bico_pato', 'ilg_t11_bico_pato'], minScore: 40, desc: 'Frenagem forte na subida + trail curto' },
          { title: 'Junção', exercises: ['ilg_t12_juncao', 'ilg_t12_juncao'], minScore: 45, desc: 'A curva mais importante — saída para a reta' },
          { title: 'Subida dos Boxes', exercises: ['ilg_t13_subida_boxes', 'ilg_t13_subida_boxes'], minScore: 45, desc: 'Aceleração máxima na subida' },
          { title: 'Setor 3 completo', exercises: ['ilg_t10_mergulho', 'ilg_t11_bico_pato', 'ilg_t12_juncao'], minScore: 40, desc: 'Mergulho → Bico de Pato → Junção' },
        ]
      },
      {
        title: 'Volta Completa e Boxes',
        sessions: [
          { title: 'Entrada de Boxes', exercises: ['ilg_pit_entry'], minScore: 45, desc: 'Desacelere e desvie para o pit lane' },
          { title: 'Meia volta', exercises: ['ilg_half_lap'], minScore: 35, desc: 'Setores 1 e 2 contínuos — 5 curvas em sequência sem parar' },
          { title: 'Volta completa', exercises: ['ilg_full_lap'], minScore: 30, desc: 'Todas as 9 curvas numa volta ininterrupta de Interlagos!' },
        ]
      },
    ]
  },
];
