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
    filterEnabled: true,
    weeks: [
      {
        title: 'Aquecimento pré-corrida',
        sessions: [
          { title: 'Aquecer freio', exercises: ['b_threshold', 'b_trail'], minScore: 50, desc: 'Aqueça a frenagem', inputs: ['brake'] },
          { title: 'Aquecer acelerador', exercises: ['t_smooth_exit', 't_aggressive_exit'], minScore: 50, desc: 'Calibre a dosagem de gás', inputs: ['throttle'] },
          { title: 'Aquecer volante', exercises: ['s_smooth_turn_r', 's_chicane'], minScore: 45, desc: 'Suavize as mãos', inputs: ['steering'] },
          { title: 'Aquecer câmbio', exercises: ['seq_upshift_basic', 'seq_downshift_basic'], minScore: 45, desc: 'Aqueça o timing de troca', inputs: ['gear'] },
          { title: 'Transições pedais', exercises: ['x_trail_throttle', 'x_corner_exit'], minScore: 45, desc: 'Freio→gás, volante→gás', inputs: ['brake', 'throttle'] },
          { title: 'Transições com volante', exercises: ['x_brake_steer', 'x_full_corner'], minScore: 45, desc: 'Freio + volante + acelerador', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Frenagem com reduções', exercises: ['seq_braking_downshift', 'seq_braking_downshift'], minScore: 40, desc: 'Freio + reduções sequenciais', inputs: ['brake', 'gear'] },
          { title: 'Largada completa', exercises: ['x_launch_with_shifts'], minScore: 40, desc: 'Embreagem + acelerador + trocas', inputs: ['clutch', 'throttle', 'gear'] },
          { title: 'Simulação de volta', exercises: ['x_brake_downshift_corner', 'x_full_corner', 'x_trail_throttle'], minScore: 42, desc: 'Sequência completa — pronto pra pista', inputs: ['brake', 'throttle', 'steering', 'gear'] },
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
    desc: 'Treine cada curva do Autódromo José Carlos Pace. Cenários reais com freio, volante, acelerador e câmbio.',
    icon: '🇧🇷',
    color: '#009739',
    level: 'Pista Real',
    filterEnabled: true,
    weeks: [
      {
        title: 'Setor 1 — Senna S, Curva do Sol e Descida',
        sessions: [
          { title: 'Senna S — Entrada', exercises: ['ilg_t1_senna_s', 'ilg_t1_senna_s'], minScore: 40, desc: 'Frenagem forte + trail na curva mais icônica', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Senna S — Saída', exercises: ['ilg_t2_senna_s2', 'ilg_t2_senna_s2'], minScore: 40, desc: 'Transição rápida para a direita', inputs: ['throttle', 'steering'] },
          { title: 'Senna S Completo', exercises: ['ilg_t1_senna_s', 'ilg_t2_senna_s2'], minScore: 45, desc: 'As duas partes em sequência', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Curva do Sol', exercises: ['ilg_t3_curva_sol', 'ilg_t3_curva_sol'], minScore: 40, desc: 'Frenagem leve + trail longo', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Descida do Lago', exercises: ['ilg_t4_descida_lago', 'ilg_t4_descida_lago'], minScore: 40, desc: 'Frenagem em descida — suavidade', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 1 completo', exercises: ['ilg_t1_senna_s', 'ilg_t3_curva_sol', 'ilg_t4_descida_lago'], minScore: 40, desc: 'Senna S → Sol → Descida em sequência', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 1 + reduções', exercises: ['seq_braking_downshift', 'ilg_t1_senna_s'], minScore: 38, desc: 'Frenagem com reduções antes do S do Senna', inputs: ['brake', 'throttle', 'gear'] },
        ]
      },
      {
        title: 'Setor 2 — Laranjinha, Ferradura e Pinheirinho',
        sessions: [
          { title: 'Laranjinha', exercises: ['ilg_t6_laranjinha', 'ilg_t6_laranjinha'], minScore: 45, desc: 'Curva rápida com feathering — sem freio!', inputs: ['throttle', 'steering'] },
          { title: 'Ferradura', exercises: ['ilg_t7_ferradura', 'ilg_t7_ferradura'], minScore: 40, desc: 'Curva longa de direita — paciência', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Pinheirinho', exercises: ['ilg_t8_pinheirinho', 'ilg_t8_pinheirinho'], minScore: 40, desc: 'Hairpin — esterço máximo e saída paciente', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 2 completo', exercises: ['ilg_t6_laranjinha', 'ilg_t7_ferradura', 'ilg_t8_pinheirinho'], minScore: 40, desc: 'As três curvas do setor 2 em sequência', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 2 + câmbio', exercises: ['seq_downshift_basic', 'ilg_t8_pinheirinho', 'seq_upshift_basic'], minScore: 38, desc: 'Reduz antes do Pinheirinho, sobe na saída', inputs: ['brake', 'throttle', 'gear'] },
        ]
      },
      {
        title: 'Setor 3 — Mergulho, Bico de Pato e Junção',
        sessions: [
          { title: 'Mergulho', exercises: ['ilg_t10_mergulho', 'ilg_t10_mergulho'], minScore: 40, desc: 'A descida mais íngreme do circuito', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Bico de Pato', exercises: ['ilg_t11_bico_pato', 'ilg_t11_bico_pato'], minScore: 40, desc: 'Frenagem forte na subida + trail curto', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Junção', exercises: ['ilg_t12_juncao', 'ilg_t12_juncao'], minScore: 45, desc: 'A curva mais importante — saída para a reta', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Subida dos Boxes', exercises: ['ilg_t13_subida_boxes', 'ilg_t13_subida_boxes'], minScore: 45, desc: 'Aceleração máxima na subida', inputs: ['throttle', 'steering'] },
          { title: 'Setor 3 completo', exercises: ['ilg_t10_mergulho', 'ilg_t11_bico_pato', 'ilg_t12_juncao'], minScore: 40, desc: 'Mergulho → Bico de Pato → Junção', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 3 + reduções', exercises: ['seq_braking_downshift', 'ilg_t12_juncao', 'seq_upshift_basic'], minScore: 38, desc: 'Reduz no mergulho, sobe na saída da junção', inputs: ['brake', 'throttle', 'gear'] },
        ]
      },
      {
        title: 'Boxes — Entrada e Saída',
        sessions: [
          { title: 'Entrada de Boxes', exercises: ['ilg_pit_entry', 'ilg_pit_entry'], minScore: 45, desc: 'Desacelere e desvie para o pit lane', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Saída de Boxes', exercises: ['ilg_pit_exit', 'ilg_pit_exit'], minScore: 45, desc: 'Saia do pit e faça o merge com a pista', inputs: ['throttle', 'steering'] },
          { title: 'Pit stop completo', exercises: ['ilg_pit_entry', 'ilg_pit_exit'], minScore: 42, desc: 'Entrada e saída em sequência — como num pit stop real', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Pit + reduções', exercises: ['seq_downshift_basic', 'ilg_pit_entry', 'ilg_pit_exit', 'seq_upshift_basic'], minScore: 38, desc: 'Reduz antes do pit, sobe marcha na saída', inputs: ['brake', 'throttle', 'steering', 'gear'] },
        ]
      },
    ]
  },

  // ── Spa-Francorchamps ──
  {
    id: 'prog_spa',
    name: 'Spa-Francorchamps',
    desc: 'Treine cada setor do circuito belga. Eau Rouge, Blanchimont e Bus Stop.',
    icon: '🇧🇪',
    color: '#e74c3c',
    level: 'Pista Real',
    filterEnabled: true,
    weeks: [
      {
        title: 'Setor 1 — La Source e Eau Rouge',
        sessions: [
          { title: 'La Source', exercises: ['spa_t1_la_source', 'spa_t1_la_source'], minScore: 40, desc: 'Hairpin de direita após a reta', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Eau Rouge / Raidillon', exercises: ['spa_t3_eau_rouge', 'spa_t3_eau_rouge'], minScore: 40, desc: 'O S mais famoso do mundo', inputs: ['throttle', 'steering'] },
          { title: 'Les Combes', exercises: ['spa_t5_les_combes', 'spa_t5_les_combes'], minScore: 40, desc: 'Chicane no topo da colina', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 1 completo', exercises: ['spa_t1_la_source', 'spa_t3_eau_rouge', 'spa_t5_les_combes'], minScore: 38, desc: 'As 3 curvas do setor 1', inputs: ['brake', 'throttle', 'steering'] },
        ]
      },
      {
        title: 'Setor 2 — Pouhon e Stavelot',
        sessions: [
          { title: 'Pouhon', exercises: ['spa_t11_pouhon', 'spa_t11_pouhon'], minScore: 40, desc: 'Curva dupla de alta velocidade', inputs: ['throttle', 'steering'] },
          { title: 'Stavelot', exercises: ['spa_t13_stavelot', 'spa_t13_stavelot'], minScore: 40, desc: 'Curva de direita em subida', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 2 completo', exercises: ['spa_t11_pouhon', 'spa_t13_stavelot'], minScore: 38, desc: 'Pouhon + Stavelot', inputs: ['brake', 'throttle', 'steering'] },
        ]
      },
      {
        title: 'Setor 3 — Blanchimont e Bus Stop',
        sessions: [
          { title: 'Blanchimont', exercises: ['spa_t17_blanchimont', 'spa_t17_blanchimont'], minScore: 40, desc: 'Curva rápida de esquerda — coragem', inputs: ['throttle', 'steering'] },
          { title: 'Bus Stop Chicane', exercises: ['spa_t18_bus_stop', 'spa_t18_bus_stop'], minScore: 40, desc: 'Chicane final antes da reta', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 3 completo', exercises: ['spa_t17_blanchimont', 'spa_t18_bus_stop'], minScore: 38, desc: 'Blanchimont + Bus Stop', inputs: ['brake', 'throttle', 'steering'] },
        ]
      },
    ]
  },

  // ── Monza ──
  {
    id: 'prog_monza',
    name: 'Monza — Templo da Velocidade',
    desc: 'Frenagens pesadas e chicanes rápidas no circuito mais veloz do calendário.',
    icon: '🇮🇹',
    color: '#27ae60',
    level: 'Pista Real',
    filterEnabled: true,
    weeks: [
      {
        title: 'Setor 1 — Chicanes e Curva Grande',
        sessions: [
          { title: 'Rettifilo (Chicane 1)', exercises: ['mza_t1_rettifilo', 'mza_t1_rettifilo'], minScore: 38, desc: 'A frenagem mais pesada do calendário', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Curva Grande', exercises: ['mza_t3_curva_grande', 'mza_t3_curva_grande'], minScore: 42, desc: 'Alta velocidade com gás parcial', inputs: ['throttle', 'steering'] },
          { title: 'Roggia (Chicane 2)', exercises: ['mza_t5_roggia', 'mza_t5_roggia'], minScore: 38, desc: 'Segunda chicane — esquerda-direita', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 1 completo', exercises: ['mza_t1_rettifilo', 'mza_t3_curva_grande', 'mza_t5_roggia'], minScore: 36, desc: 'Chicanes + Curva Grande', inputs: ['brake', 'throttle', 'steering'] },
        ]
      },
      {
        title: 'Setor 2 — Lesmos e Ascari',
        sessions: [
          { title: 'Lesmo 1', exercises: ['mza_t7_lesmo1', 'mza_t7_lesmo1'], minScore: 40, desc: 'Curva em descida — cuidado', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Lesmo 2', exercises: ['mza_t8_lesmo2', 'mza_t8_lesmo2'], minScore: 40, desc: 'Mais apertada — saída crucial', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Ascari', exercises: ['mza_t9_ascari', 'mza_t9_ascari'], minScore: 38, desc: 'S em 3 partes — ritmo', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor 2 completo', exercises: ['mza_t7_lesmo1', 'mza_t8_lesmo2', 'mza_t9_ascari'], minScore: 36, desc: 'Lesmos + Ascari', inputs: ['brake', 'throttle', 'steering'] },
        ]
      },
      {
        title: 'Setor 3 — Parabolica',
        sessions: [
          { title: 'Parabolica', exercises: ['mza_t11_parabolica', 'mza_t11_parabolica'], minScore: 40, desc: 'A curva mais importante de Monza', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Volta simulada', exercises: ['mza_t1_rettifilo', 'mza_t5_roggia', 'mza_t7_lesmo1', 'mza_t9_ascari', 'mza_t11_parabolica'], minScore: 35, desc: 'Todas as curvas chave em sequência', inputs: ['brake', 'throttle', 'steering'] },
        ]
      },
    ]
  },

  // ── Silverstone ──
  {
    id: 'prog_silverstone',
    name: 'Silverstone — Casa da F1',
    desc: 'Curvas rápidas e o lendário complexo Maggotts-Becketts. A pista dos corajosos.',
    icon: '🇬🇧',
    color: '#2980b9',
    level: 'Pista Real',
    filterEnabled: true,
    weeks: [
      {
        title: 'Setor 2 — Copse e Maggotts-Becketts',
        sessions: [
          { title: 'Copse', exercises: ['slv_t9_copse', 'slv_t9_copse'], minScore: 42, desc: 'Curva rápida de direita — coragem', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Maggotts-Becketts-Chapel', exercises: ['slv_t10_maggotts', 'slv_t10_maggotts'], minScore: 35, desc: 'O complexo mais famoso — fluidez total', inputs: ['throttle', 'steering'] },
          { title: 'Stowe', exercises: ['slv_t14_stowe', 'slv_t14_stowe'], minScore: 40, desc: 'Frenagem forte de alta velocidade', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor rápido completo', exercises: ['slv_t9_copse', 'slv_t10_maggotts', 'slv_t14_stowe'], minScore: 36, desc: 'Copse → Maggotts → Stowe', inputs: ['brake', 'throttle', 'steering'] },
        ]
      },
      {
        title: 'Setor 3 — Vale, Abbey e Luffield',
        sessions: [
          { title: 'Vale-Club', exercises: ['slv_t15_vale', 'slv_t15_vale'], minScore: 42, desc: 'Chicane lenta — precisão', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Abbey', exercises: ['slv_t17_abbey', 'slv_t17_abbey'], minScore: 42, desc: 'Curva rápida de direita', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Luffield', exercises: ['slv_t18_luffield', 'slv_t18_luffield'], minScore: 40, desc: 'Hairpin — saída para a reta', inputs: ['brake', 'throttle', 'steering'] },
          { title: 'Setor lento completo', exercises: ['slv_t15_vale', 'slv_t17_abbey', 'slv_t18_luffield'], minScore: 38, desc: 'Vale → Abbey → Luffield', inputs: ['brake', 'throttle', 'steering'] },
        ]
      },
    ]
  },
];
