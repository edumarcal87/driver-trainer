/**
 * Video tutorial references for track exercises.
 * Each entry maps exercise ID → video info with YouTube embed, timestamps, and coaching notes.
 * 
 * Videos are curated onboard references from sim racing community content.
 * Premium content — shown only to premium users.
 * 
 * IMPORTANT: YouTube URLs use embed format for iframe compatibility.
 * The start parameter (?start=N) sets the beginning of the clip.
 * Videos load with privacy-enhanced mode (youtube-nocookie.com).
 */

// ═══════════════════════════════════
// INTERLAGOS — 🇧🇷
// ═══════════════════════════════════
const INTERLAGOS_VIDEOS = {
  ilg_t1_senna_s: {
    videoId: 'dQw4w9WgXcQ', // placeholder — replace with real onboard
    start: 0, end: 18,
    corner: 'Senna S (T1)',
    speed: '280 → 90 km/h',
    gear: '6ª → 2ª',
    brakingRef: '2 car lengths antes do fim do muro Rolex',
    keyPoints: [
      { time: '0:02', label: 'Ponto de frenagem', desc: 'Freia forte descendo a ladeira — cuidado com traseira leve' },
      { time: '0:05', label: 'Trail braking', desc: 'Soltar freio gradualmente enquanto esterça à esquerda' },
      { time: '0:08', label: 'Transição', desc: 'Fluir do esterço esquerdo para direito — gás parcial' },
      { time: '0:12', label: 'Saída', desc: 'Full gas quando volante endireitar — usar toda a pista' },
    ],
  },
  ilg_t4_descida_lago: {
    videoId: 'dQw4w9WgXcQ',
    start: 18, end: 32,
    corner: 'Descida do Lago (T4-5)',
    speed: '250 → 120 km/h',
    gear: '5ª → 3ª',
    brakingRef: 'Placa de 100m no lado direito',
    keyPoints: [
      { time: '0:19', label: 'Frenagem em descida', desc: 'Pressão mais suave que normal — pista inclinada para baixo' },
      { time: '0:22', label: 'Apex T4', desc: 'Toque na zebra interna onde a salsichão amarela começa' },
      { time: '0:26', label: 'Saída + T5', desc: 'Gás progressivo, não deixe o carro ir muito largo' },
    ],
  },
  ilg_t8_cotovelo: {
    videoId: 'dQw4w9WgXcQ',
    start: 40, end: 54,
    corner: 'Cotovelo (T8)',
    speed: '200 → 70 km/h',
    gear: '4ª → 1ª',
    brakingRef: 'Logo após a placa DHL',
    keyPoints: [
      { time: '0:41', label: 'Frenagem dura', desc: 'A hairpin mais lenta — freia muito forte' },
      { time: '0:45', label: 'Apex tardio', desc: 'Gire tarde, no fim da zebra amarela interna' },
      { time: '0:49', label: 'Paciência', desc: 'Espere o carro rotar antes de acelerar' },
    ],
  },
  ilg_t10_bico_pato: {
    videoId: 'dQw4w9WgXcQ',
    start: 55, end: 68,
    corner: 'Bico de Pato (T10)',
    speed: '180 → 75 km/h',
    gear: '3ª → 1ª',
    brakingRef: 'Onde asfalto vira grama do lado esquerdo',
    keyPoints: [
      { time: '0:56', label: 'Frenagem forte', desc: 'Descer para 1ª marcha, apex tardio' },
      { time: '0:60', label: 'Apex profundo', desc: 'Cole na zebra interna até ela acabar' },
      { time: '0:64', label: 'Saída cuidadosa', desc: 'Gás progressivo — saída em subida, grip variável' },
    ],
  },
  ilg_t12_juncao: {
    videoId: 'dQw4w9WgXcQ',
    start: 68, end: 82,
    corner: 'Junção (T12)',
    speed: '160 → 95 km/h',
    gear: '3ª → 2ª',
    brakingRef: '1 carro após o fim da grama à direita',
    keyPoints: [
      { time: '0:69', label: 'Frenagem média', desc: 'Não exagere — a curva é de média velocidade' },
      { time: '0:73', label: 'Apex mid-corner', desc: 'Pegar apex no meio da zebra interna' },
      { time: '0:77', label: 'Saída = reta principal', desc: 'Boa saída aqui vale 3-4 km/h na reta. Fundamental!' },
    ],
  },
};

// ═══════════════════════════════════
// SPA — 🇧🇪
// ═══════════════════════════════════
const SPA_VIDEOS = {
  spa_t1_la_source: {
    videoId: 'dQw4w9WgXcQ',
    start: 0, end: 15,
    corner: 'La Source (T1)',
    speed: '310 → 65 km/h',
    gear: '7ª → 1ª',
    brakingRef: 'Placa de 100m',
    keyPoints: [
      { time: '0:01', label: 'Frenagem máxima', desc: 'Hairpin clássica — freia muito forte e tarde' },
      { time: '0:05', label: 'Apex tardio', desc: 'Vá largo na entrada para cortar no apex tardio' },
      { time: '0:09', label: 'Saída = Eau Rouge', desc: 'Velocidade de saída é crucial para Eau Rouge' },
    ],
  },
  spa_t5_bruxelles: {
    videoId: 'dQw4w9WgXcQ',
    start: 28, end: 42,
    corner: 'Bruxelles (T5)',
    speed: '230 → 110 km/h',
    gear: '5ª → 3ª',
    brakingRef: 'Após o muro à direita',
    keyPoints: [
      { time: '0:29', label: 'Frenagem em subida', desc: 'A subida ajuda a frear — menos pressão necessária' },
      { time: '0:34', label: 'Trail longo', desc: 'Curva de raio amplo — trail braking longo e progressivo' },
      { time: '0:38', label: 'Saída limpa', desc: 'Não vá largo — próxima curva exige posição' },
    ],
  },
  spa_t12_bus_stop: {
    videoId: 'dQw4w9WgXcQ',
    start: 65, end: 80,
    corner: 'Bus Stop (T18-19)',
    speed: '300 → 80 km/h',
    gear: '7ª → 2ª',
    brakingRef: 'Placa de 150m',
    keyPoints: [
      { time: '0:66', label: 'Frenagem forte', desc: 'Chicane rápida — sacrifique entrada para melhor saída' },
      { time: '0:71', label: 'Cortar zebra', desc: 'Use a zebra interna na primeira parte' },
      { time: '0:76', label: 'Saída → reta principal', desc: 'Full gas no mais cedo possível — vale na reta' },
    ],
  },
};

// ═══════════════════════════════════
// MONZA — 🇮🇹
// ═══════════════════════════════════
const MONZA_VIDEOS = {
  mza_t1_rettifilo: {
    videoId: 'dQw4w9WgXcQ',
    start: 0, end: 18,
    corner: 'Rettifilo (T1)',
    speed: '340 → 80 km/h',
    gear: '8ª → 2ª',
    brakingRef: 'Placa de 150m',
    keyPoints: [
      { time: '0:01', label: 'Frenagem mais forte do calendário', desc: 'De 340 para 80 — pressão máxima absoluta' },
      { time: '0:06', label: 'Não trave!', desc: 'A tentação de travar é enorme — module a pressão' },
      { time: '0:10', label: 'Chicane dupla', desc: 'Sacrifique T1 para melhor saída em T2' },
    ],
  },
  mza_t4_variante_roggia: {
    videoId: 'dQw4w9WgXcQ',
    start: 25, end: 38,
    corner: 'Variante della Roggia (T4-5)',
    speed: '310 → 85 km/h',
    gear: '7ª → 2ª',
    brakingRef: 'Placa de 100m',
    keyPoints: [
      { time: '0:26', label: 'Outra frenagem brutal', desc: 'Quase tão forte quanto T1 — chicane esq-dir' },
      { time: '0:30', label: 'Toque na zebra', desc: 'Corte a zebra interna no primeiro vértice' },
      { time: '0:34', label: 'Saída rápida', desc: 'Alinhe cedo para acelerar forte na reta seguinte' },
    ],
  },
  mza_t8_lesmo1: {
    videoId: 'dQw4w9WgXcQ',
    start: 42, end: 55,
    corner: 'Lesmo 1 (T8)',
    speed: '290 → 170 km/h',
    gear: '6ª → 4ª',
    brakingRef: 'Início da zebra à direita',
    keyPoints: [
      { time: '0:43', label: 'Frenagem em velocidade', desc: 'Curva rápida — freia suave e progressivo' },
      { time: '0:47', label: 'Trail braking longo', desc: 'Não solte o freio cedo — trail até o apex' },
      { time: '0:51', label: 'Comprometimento', desc: 'Confie no downforce e acelere cedo' },
    ],
  },
};

// ═══════════════════════════════════
// SILVERSTONE — 🇬🇧
// ═══════════════════════════════════
const SILVERSTONE_VIDEOS = {
  slv_t1_copse: {
    videoId: 'dQw4w9WgXcQ',
    start: 0, end: 14,
    corner: 'Copse (T1 histórica)',
    speed: '290 → 220 km/h',
    gear: '7ª → 5ª',
    brakingRef: 'Placa de 100m à esquerda',
    keyPoints: [
      { time: '0:01', label: 'Lift, não freio', desc: 'Carros com downforce passam flat — GT freia suave' },
      { time: '0:05', label: 'Apex cedo', desc: 'Cole no apex para não perder velocidade na saída' },
      { time: '0:09', label: 'Full gas na saída', desc: 'Use toda a pista — saída larga é OK aqui' },
    ],
  },
  slv_t6_brooklands: {
    videoId: 'dQw4w9WgXcQ',
    start: 28, end: 42,
    corner: 'Brooklands (T6)',
    speed: '260 → 100 km/h',
    gear: '6ª → 3ª',
    brakingRef: 'Fim do muro de boxes à direita',
    keyPoints: [
      { time: '0:29', label: 'Frenagem forte', desc: 'Redução significativa para curva lenta' },
      { time: '0:33', label: 'Trail para Luffield', desc: 'Brooklands conecta com Luffield — posicione-se' },
      { time: '0:38', label: 'Saída de Luffield', desc: 'Saída da combinação é mais importante que entrada' },
    ],
  },
  slv_t15_stowe: {
    videoId: 'dQw4w9WgXcQ',
    start: 62, end: 75,
    corner: 'Stowe (T15)',
    speed: '300 → 170 km/h',
    gear: '7ª → 4ª',
    brakingRef: 'Após a saída de Hangar Straight',
    keyPoints: [
      { time: '0:63', label: 'Frenagem de alta velocidade', desc: 'Vem da reta mais rápida — freia forte mas estável' },
      { time: '0:67', label: 'Apex mid', desc: 'Nem cedo nem tarde — no meio da zebra' },
      { time: '0:71', label: 'Saída ampla', desc: 'Pode usar toda a pista na saída — sem muro perto' },
    ],
  },
};

// ═══════════════════════════════════
// EXPORT MERGED
// ═══════════════════════════════════
export const CORNER_VIDEOS = {
  ...INTERLAGOS_VIDEOS,
  ...SPA_VIDEOS,
  ...MONZA_VIDEOS,
  ...SILVERSTONE_VIDEOS,
};

export function getVideoForExercise(exId) {
  return CORNER_VIDEOS[exId] || null;
}
