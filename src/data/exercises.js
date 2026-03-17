export const BRAKE_EXERCISES = [
  { id:'b_threshold', name:'Threshold braking', desc:'Frenagem forte e constante — máxima desaceleração', icon:'█',
    curve:t=>(t<.08?t/.08:t<.85?1:1-(t-.85)/.15), duration:3000, diff:1 },
  { id:'b_trail', name:'Trail braking', desc:'Forte no início, solta gradual na curva', icon:'◣',
    curve:t=>(t<.1?t/.1:Math.max(0,1-(t-.1)*1.11)), duration:3500, diff:2 },
  { id:'b_progressive', name:'Progressive', desc:'Aumento gradual até o pico', icon:'◢',
    curve:t=>(t<.6?Math.pow(t/.6,1.5):t<.8?1:1-(t-.8)/.2), duration:3000, diff:2 },
  { id:'b_stab', name:'Stab braking', desc:'Toque rápido e agressivo', icon:'▲',
    curve:t=>(t<.15?t/.15:t<.3?1:Math.max(0,1-(t-.3)/.25)), duration:2000, diff:1 },
  { id:'b_double', name:'Double tap', desc:'Duas frenagens em sequência', icon:'▲▲',
    curve:t=>{if(t<.1)return t/.1;if(t<.2)return 1-(t-.1)/.1;if(t<.4)return 0;if(t<.5)return(t-.4)/.1;if(t<.65)return 1;if(t<.8)return 1-(t-.65)/.15;return 0;},
    duration:3000, diff:3 },
  { id:'b_late_trail', name:'Late trail', desc:'Frenagem tardia com trail longo', icon:'◥',
    curve:t=>(t<.05?t/.05*.9:t<.15?.9+(t-.05)/.1*.1:Math.max(0,1-(t-.15)/(1-.15))), duration:4000, diff:3 },
];

export const THROTTLE_EXERCISES = [
  { id:'t_smooth_exit', name:'Saída suave', desc:'Aceleração progressiva na saída da curva', icon:'🟢',
    curve:t=>(t<.1?0:t<.8?Math.pow((t-.1)/.7,1.3):1), duration:3500, diff:1, pedal:'throttle' },
  { id:'t_aggressive_exit', name:'Saída agressiva', desc:'Aceleração rápida pós-apex', icon:'⚡',
    curve:t=>(t<.05?0:t<.25?((t-.05)/.2):1), duration:2500, diff:2, pedal:'throttle' },
  { id:'t_feathering', name:'Feathering', desc:'Modulação delicada do acelerador em curva', icon:'〰️',
    curve:t=>{const base=.3+.15*Math.sin(t*Math.PI*4);return t<.05?t/.05*.3:t>.9?base+(1-base)*((t-.9)/.1):base;},
    duration:4000, diff:3, pedal:'throttle' },
  { id:'t_lift_reapply', name:'Lift & reapply', desc:'Levanta e reacelera — correção de trajetória', icon:'↕️',
    curve:t=>{if(t<.15)return t/.15;if(t<.3)return 1-(t-.15)/.15*.7;if(t<.5)return .3;if(t<.7)return .3+(t-.5)/.2*.7;return 1;},
    duration:3500, diff:2, pedal:'throttle' },
];

export const CLUTCH_EXERCISES = [
  { id:'c_quick_shift', name:'Troca rápida', desc:'Embreagem rápida para troca de marcha', icon:'⚙️',
    curve:t=>(t<.1?t/.1:t<.3?1:t<.5?1-(t-.3)/.2:0), duration:2000, diff:1, pedal:'clutch' },
  { id:'c_heel_toe', name:'Heel-toe prep', desc:'Embreagem para técnica de heel-toe', icon:'👟',
    curve:t=>{if(t<.1)return t/.1;if(t<.25)return 1;if(t<.5)return 1-(t-.25)/.25*.5;if(t<.7)return .5;if(t<.9)return .5-(t-.7)/.2*.5;return 0;},
    duration:3000, diff:3, pedal:'clutch' },
  { id:'c_launch', name:'Launch control', desc:'Soltar embreagem para largada perfeita', icon:'🏁',
    curve:t=>(t<.05?1:t<.15?1:t<.6?1-(t-.15)/.45:t<.8?0+(t-.6)/.2*.15:.15-(t-.8)/.2*.15),
    duration:3000, diff:2, pedal:'clutch' },
];

// ── Steering exercises ──
// Curve values: 0.5 = centro, 0 = esquerda total, 1 = direita total
export const STEERING_EXERCISES = [
  { id:'s_smooth_turn_r', name:'Curva suave (direita)', desc:'Entrada progressiva em curva de média velocidade', icon:'↪️',
    curve:t=>{if(t<.1)return .5;if(t<.4)return .5+((t-.1)/.3)*.4;if(t<.7)return .9;if(t<.9)return .9-((t-.7)/.2)*.4;return .5;},
    duration:4000, diff:1, pedal:'steering' },
  { id:'s_smooth_turn_l', name:'Curva suave (esquerda)', desc:'Entrada progressiva virando à esquerda', icon:'↩️',
    curve:t=>{if(t<.1)return .5;if(t<.4)return .5-((t-.1)/.3)*.4;if(t<.7)return .1;if(t<.9)return .1+((t-.7)/.2)*.4;return .5;},
    duration:4000, diff:1, pedal:'steering' },
  { id:'s_chicane', name:'Chicane', desc:'Esquerda-direita rápida — troca de direção precisa', icon:'🔀',
    curve:t=>{
      if(t<.05)return .5;if(t<.2)return .5-((t-.05)/.15)*.4; // left
      if(t<.35)return .1+((t-.2)/.15)*.8; // cross to right
      if(t<.55)return .9; // hold right
      if(t<.7)return .9-((t-.55)/.15)*.4; // back center
      return .5;
    }, duration:4000, diff:2, pedal:'steering' },
  { id:'s_oversteer_recovery', name:'Recuperar traseirada', desc:'Contra-esterço rápido e retorno ao centro', icon:'🔄',
    curve:t=>{
      // Car goes right, counter-steer left, then back
      if(t<.05)return .5;
      if(t<.15)return .5-((t-.05)/.1)*.45; // quick counter-steer left
      if(t<.3)return .05; // hold counter
      if(t<.5)return .05+((t-.3)/.2)*.35; // ease back
      if(t<.7)return .4+((t-.5)/.2)*.15; // small correction right
      if(t<.85)return .55-((t-.7)/.15)*.05;
      return .5;
    }, duration:3500, diff:3, pedal:'steering' },
  { id:'s_slalom', name:'Slalom', desc:'Movimentos rítmicos esquerda-direita', icon:'〜',
    curve:t=>{
      return .5 + .35 * Math.sin(t * Math.PI * 6);
    }, duration:5000, diff:2, pedal:'steering' },
  { id:'s_hairpin', name:'Hairpin (grampo)', desc:'Esterço máximo em curva lenta e retorno', icon:'⤵️',
    curve:t=>{
      if(t<.08)return .5;if(t<.2)return .5+((t-.08)/.12)*.48; // full lock right
      if(t<.6)return .98; // hold lock
      if(t<.85)return .98-((t-.6)/.25)*.48; // unwind
      return .5;
    }, duration:4500, diff:2, pedal:'steering' },
  { id:'s_correction', name:'Correção rápida', desc:'Micro-correção de trajetória em reta', icon:'↔️',
    curve:t=>{
      if(t<.2)return .5;
      if(t<.3)return .5+((t-.2)/.1)*.12; // slight right
      if(t<.5)return .62-((t-.3)/.2)*.24; // correct left
      if(t<.65)return .38+((t-.5)/.15)*.12; // back center
      return .5;
    }, duration:3000, diff:1, pedal:'steering' },
];

// ── Combined exercises (multi-input) ──
// Each has a `curves` object with a curve per input type
export const COMBINED_EXERCISES = [
  { id:'x_trail_throttle', name:'Trail brake → Aceleração', desc:'Frenagem trail + retomada de acelerador na saída', icon:'🔥',
    pedal:'combined',
    curves: {
      brake: t => (t<.05?t/.05:t<.5?1-(t-.05)/.45:0),
      throttle: t => (t<.45?0:t<.9?Math.pow((t-.45)/.45,1.2):1),
    },
    duration: 4000, diff: 2 },
  { id:'x_heel_toe', name:'Heel-toe completo', desc:'Freio + embreagem + blip de acelerador para redução', icon:'👟🔥',
    pedal:'combined',
    curves: {
      brake: t => (t<.08?t/.08:t<.6?1:t<.8?1-(t-.6)/.2:0),
      clutch: t => (t<.2?0:t<.3?(t-.2)/.1:t<.55?1:t<.7?1-(t-.55)/.15:0),
      throttle: t => (t<.3?0:t<.4?Math.pow((t-.3)/.1,2)*.6:t<.5?.6-(t-.4)/.1*.6:0),
    },
    duration: 4500, diff: 3 },
  { id:'x_brake_steer', name:'Frenagem + curva', desc:'Trail brake enquanto esterça para a curva', icon:'🏎️',
    pedal:'combined',
    curves: {
      brake: t => (t<.08?t/.08:t<.6?1-(t-.08)/.52*.8:.2-(t-.6)/.4*.2),
      steering: t => (t<.1?.5:t<.5?.5+((t-.1)/.4)*.35:t<.8?.85:t<.95?.85-((t-.8)/.15)*.35:.5),
    },
    duration: 4500, diff: 3 },
  { id:'x_launch_start', name:'Largada perfeita', desc:'Soltar embreagem + dosar acelerador na largada', icon:'🏁💨',
    pedal:'combined',
    curves: {
      clutch: t => (t<.05?1:t<.4?1-(t-.05)/.35:0),
      throttle: t => (t<.05?0:t<.3?Math.pow((t-.05)/.25,.8)*.7:t<.6?.7+(t-.3)/.3*.3:1),
    },
    duration: 3500, diff: 2 },
  { id:'x_downshift_sequence', name:'Sequência de reduções', desc:'Freio constante + 3 toques de embreagem para reduções', icon:'⬇️⚙️',
    pedal:'combined',
    curves: {
      brake: t => (t<.08?t/.08:t<.85?1:1-(t-.85)/.15),
      clutch: t => {
        const pulses = [[.15,.25],[.35,.45],[.55,.65]];
        for (const [s,e] of pulses) {
          if (t>=s && t<s+.03) return (t-s)/.03;
          if (t>=s+.03 && t<e-.03) return 1;
          if (t>=e-.03 && t<e) return 1-(t-(e-.03))/.03;
        }
        return 0;
      },
    },
    duration: 4000, diff: 3 },
  { id:'x_corner_exit', name:'Saída de curva completa', desc:'Volante endireita + acelerador progressivo', icon:'↗️',
    pedal:'combined',
    curves: {
      steering: t => (t<.05?.8:t<.6?.8-((t-.05)/.55)*.3:t<.9?.5:t<1?.5:0.5),
      throttle: t => (t<.2?0:t<.7?Math.pow((t-.2)/.5,1.1):t<.9?1:1),
    },
    duration: 4000, diff: 2 },
  { id:'x_chicane_throttle', name:'Chicane com aceleração', desc:'Volante esq-dir + dosagem de acelerador entre curvas', icon:'🔀⚡',
    pedal:'combined',
    curves: {
      steering: t => {
        if(t<.05)return .5;if(t<.2)return .5-((t-.05)/.15)*.35;if(t<.35)return .15+((t-.2)/.15)*.7;
        if(t<.55)return .85;if(t<.7)return .85-((t-.55)/.15)*.35;return .5;
      },
      throttle: t => {
        if(t<.1)return .6;if(t<.2)return .6-((t-.1)/.1)*.4;if(t<.35)return .2+((t-.2)/.15)*.3;
        if(t<.45)return .5-((t-.35)/.1)*.3;if(t<.55)return .2;if(t<.7)return .2+((t-.55)/.15)*.8;return 1;
      },
    },
    duration: 5000, diff: 3 },
  { id:'x_full_corner', name:'Curva completa', desc:'Freio + volante + acelerador — a curva perfeita', icon:'🏆',
    pedal:'combined',
    curves: {
      brake: t => (t<.05?t/.05:t<.35?1-(t-.05)/.3:0),
      steering: t => (t<.1?.5:t<.4?.5+((t-.1)/.3)*.35:t<.7?.85:t<.9?.85-((t-.7)/.2)*.35:.5),
      throttle: t => (t<.4?0:t<.9?Math.pow((t-.4)/.5,1.3):1),
    },
    duration: 5000, diff: 3 },
];

export const ALL_EXERCISES = [...BRAKE_EXERCISES, ...THROTTLE_EXERCISES, ...CLUTCH_EXERCISES, ...STEERING_EXERCISES, ...COMBINED_EXERCISES];

export const EXERCISE_CATEGORIES = [
  { key:'brake', label:'Freio', color:'#ff4757', exercises:BRAKE_EXERCISES },
  { key:'throttle', label:'Acelerador', color:'#2ed573', exercises:THROTTLE_EXERCISES },
  { key:'clutch', label:'Embreagem', color:'#ffa502', exercises:CLUTCH_EXERCISES },
  { key:'steering', label:'Volante', color:'#3b82f6', exercises:STEERING_EXERCISES },
  { key:'combined', label:'Combinado', color:'#a855f7', exercises:COMBINED_EXERCISES },
];

export const TOLERANCE = 0.12;
