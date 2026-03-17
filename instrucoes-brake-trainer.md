# 🏎️ Brake Trainer — Simulador de Treino de Pedais

Ferramenta local para treinar curvas de pressão do **freio, acelerador e embreagem** usando seu **Logitech G29** com telemetria real dos seus simuladores favoritos.

---

## Simuladores Compatíveis

| Simulador | Fonte de Telemetria | Formato |
|-----------|---------------------|---------|
| iRacing | Garage61 | CSV |
| Assetto Corsa Competizione | MoTeC i2 | CSV |
| Automobilista 2 | MoTeC i2 | CSV |
| F1 25 | Sim Racing Telemetry | CSV |

---

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
   - Acesse https://nodejs.org e baixe a versão LTS
   - Durante a instalação, marque "Add to PATH"
   - Verifique: `node --version`

2. **VS Code** (que você já tem instalado)

---

## Passo a Passo — Instalação e Execução

### Passo 1: Extrair o projeto

Extraia o arquivo `brake-trainer-project.zip` para uma pasta.
Exemplo: `C:\Users\SeuNome\Projetos\brake-trainer-project`

### Passo 2: Abrir no VS Code

**Arquivo → Abrir Pasta** (ou `Ctrl+K Ctrl+O`) → selecione `brake-trainer-project`

### Passo 3: Abrir o terminal

Pressione `` Ctrl+` `` no VS Code.

### Passo 4: Instalar dependências

```bash
npm install
```

### Passo 5: Iniciar o servidor

```bash
npm run dev
```

O navegador abrirá em `http://localhost:3000`.

### Passo 6: Configurar os pedais (IMPORTANTE)

1. Conecte o G29 via USB
2. Clique em **"Configurar pedais"**
3. Clique em **"Iniciar detecção"**
4. O assistente vai pedir que você pise em cada pedal (freio, acelerador, embreagem), um de cada vez
5. Ao final, verifique no painel **"Validação ao vivo"** que cada barra sobe APENAS com o pedal correto
6. Se algo estiver errado, execute novamente ou use o modo manual

### Passo 7: Parar o servidor

No terminal: `Ctrl+C`

---

## Exercícios Disponíveis (13 exercícios)

### Freio (6 exercícios)
- **Threshold braking** — Frenagem forte e constante
- **Trail braking** — Forte no início, solta gradual na curva
- **Progressive** — Aumento gradual até o pico
- **Stab braking** — Toque rápido e agressivo
- **Double tap** — Duas frenagens em sequência
- **Late trail** — Frenagem tardia com trail longo

### Acelerador (4 exercícios)
- **Saída suave** — Aceleração progressiva na saída da curva
- **Saída agressiva** — Aceleração rápida pós-apex
- **Feathering** — Modulação delicada em curva
- **Lift & reapply** — Levanta e reacelera (correção de trajetória)

### Embreagem (3 exercícios)
- **Troca rápida** — Embreagem rápida para troca de marcha
- **Heel-toe prep** — Embreagem para técnica de heel-toe
- **Launch control** — Soltar embreagem para largada perfeita

Use os filtros por categoria (Todos / Freio / Acelerador / Embreagem / Telemetria) na tela principal.

---

## Importar Telemetria Real

#### iRacing (via Garage61)
1. Acesse https://garage61.net → encontre a volta → **Export → CSV**
2. Importe no Brake Trainer

#### ACC (via MoTeC)
1. ACC: **Opções → Sistema → Habilitar logging MoTeC**
2. MoTeC i2: carregue o `.ld` → **File → Export → CSV**
3. Importe no Brake Trainer

#### Automobilista 2 (via MoTeC)
1. Arquivos em `Documentos\Automobilista 2\MoTeC`
2. MoTeC i2: carregue → exporte CSV
3. Importe no Brake Trainer

#### F1 25 (via Sim Racing Telemetry)
1. Sim Racing Telemetry (Steam) → ative UDP no F1 25
2. Grave sessão → exporte CSV
3. Importe no Brake Trainer

---

## Controles

| Tecla | Ação |
|-------|------|
| `↑` ou `W` | Aumentar pressão do pedal |
| `↓` ou `S` | Diminuir pressão do pedal |

---

## Estrutura do Projeto

```
brake-trainer-project/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx               ← Menu principal + navegação + filtros
│   ├── components/
│   │   ├── Chart.jsx          ← Gráfico SVG (cor dinâmica por pedal)
│   │   ├── ConfigScreen.jsx   ← Wizard de detecção + validação ao vivo
│   │   ├── ExerciseScreen.jsx ← Execução do exercício (multi-pedal)
│   │   └── UI.jsx             ← Componentes visuais reutilizáveis
│   ├── data/
│   │   └── exercises.js       ← 13 exercícios (freio + acelerador + embreagem)
│   └── utils/
│       ├── gamepad.js         ← Leitura multi-pedal + wizard de detecção
│       ├── scoring.js         ← Cálculo de pontuação
│       └── telemetry.js       ← Parser CSV + detecção de zonas
```

---

## Solução de Problemas

**O acelerador está sendo lido como freio (ou vice-versa)**
→ Execute o assistente de detecção em "Configurar pedais → Iniciar detecção". O G29 tem mapeamento de eixos que varia conforme o driver (G HUB vs LGS). O wizard resolve isso automaticamente.

**"npm" não é reconhecido**
→ Reinstale o Node.js marcando "Add to PATH".

**O pedal não é detectado**
→ G29 conectado via USB e ligado? Pressione qualquer botão no volante primeiro. O browser exige interação do usuário antes de detectar gamepads.

**O CSV não foi reconhecido**
→ Precisa ter coluna com cabeçalho "Brake" ou "Brake%".

**Porta 3000 em uso**
→ Altere no `vite.config.js` (linha `port: 3000`).