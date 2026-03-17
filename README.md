# 🏎️ Driver Trainer

Ferramenta de treino de **freio, acelerador, embreagem, volante e exercícios combinados** para sim racing, com suporte ao **Logitech G29** e importação de telemetria real.

**[Demo ao vivo →](https://SEU-USUARIO.github.io/brake-trainer/)**

---

## Deploy no GitHub Pages

### Pré-requisitos

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)
- **Conta no GitHub**

### Passo 1: Criar o repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `brake-trainer`
3. Deixe **público**
4. **NÃO** marque "Add a README" (já temos um)
5. Clique em **Create repository**

### Passo 2: Subir o projeto

Abra o terminal no VS Code (`` Ctrl+` ``), navegue até a pasta do projeto e execute:

```bash
cd brake-trainer-project

git init
git add .
git commit -m "Brake Trainer v1.0"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/brake-trainer.git
git push -u origin main
```

> Substitua `SEU-USUARIO` pelo seu nome de usuário do GitHub.

### Passo 3: Ativar GitHub Pages

1. No repositório, vá em **Settings → Pages**
2. Em **Source**, selecione **GitHub Actions**
3. O deploy já vai rodar automaticamente (veja a aba **Actions**)
4. Após concluído, o site estará em: `https://SEU-USUARIO.github.io/brake-trainer/`

### Passo 4: Compartilhar com amigos

Envie o link do GitHub Pages para seus amigos. Eles precisam:
- Abrir no **Chrome** ou **Edge** (melhor suporte à Gamepad API)
- Conectar o volante/pedais via USB
- Pressionar qualquer botão no volante para o browser detectar o gamepad
- Clicar em **"Configurar pedais" → "Iniciar detecção"** na primeira vez

---

## Desenvolvimento local

```bash
npm install
npm run dev
```

O servidor abre em `http://localhost:3000`.

> **Nota:** Para desenvolvimento local, se quiser remover o prefixo de path do GitHub Pages, comente a linha `base: '/brake-trainer/'` no `vite.config.js`.

---

## Atualizar o deploy

Qualquer push para a branch `main` dispara o build e deploy automaticamente via GitHub Actions:

```bash
git add .
git commit -m "descrição da mudança"
git push
```

---

## Funcionalidades

### 25 exercícios em 5 categorias

| Categoria | Exercícios | Input |
|-----------|-----------|-------|
| Freio (6) | Threshold, Trail, Progressive, Stab, Double tap, Late trail | Pedal de freio |
| Acelerador (4) | Saída suave, Agressiva, Feathering, Lift & reapply | Pedal de acelerador |
| Embreagem (3) | Troca rápida, Heel-toe prep, Launch control | Pedal de embreagem |
| Volante (7) | Curva suave L/R, Chicane, Traseirada, Slalom, Hairpin, Correção | Volante |
| Combinado (5) | Trail→acel, Heel-toe completo, Frenagem+curva, Largada, Reduções | Múltiplos inputs simultâneos |

### Telemetria real

Importe CSV de:
- **iRacing** via Garage61
- **ACC** via MoTeC
- **AMS2** via MoTeC
- **F1 25** via Sim Racing Telemetry

### Feedback inteligente

- Nota por exercício (S/A/B/C/D)
- Análise por segmento (ataque, pico, modulação, liberação)
- Dicas de melhoria contextuais
- Gráfico de evolução por sessão
- Coaching separado por tipo de input (freio/acelerador/embreagem/volante)
- Exportar relatório em PDF

### Persistência

Configurações de pedais, histórico e scores são salvos no localStorage e sobrevivem entre sessões.

---

## Estrutura do projeto

```
brake-trainer-project/
├── .github/workflows/deploy.yml   ← GitHub Actions (build + deploy)
├── index.html
├── package.json
├── vite.config.js                  ← base path para GitHub Pages
├── src/
│   ├── App.jsx
│   ├── index.css                   ← tema motorsport escuro
│   ├── main.jsx
│   ├── components/
│   │   ├── Chart.jsx               ← gráfico single-input
│   │   ├── CombinedChart.jsx       ← gráfico multi-input
│   │   ├── ConfigScreen.jsx        ← wizard + validação ao vivo
│   │   ├── ExerciseScreen.jsx      ← single + combined mode
│   │   ├── ProgressScreen.jsx      ← evolução + export PDF
│   │   └── UI.jsx                  ← componentes visuais
│   ├── data/
│   │   └── exercises.js            ← 25 exercícios
│   └── utils/
│       ├── gamepad.js              ← pedais + volante
│       ├── scoring.js              ← análise + session insights
│       ├── telemetry.js            ← CSV parser
│       ├── pdfExport.js            ← gerador de relatório
│       └── coaching.js
```

---

## Solução de problemas

**O pedal errado está sendo lido**
→ Vá em "Configurar pedais" → "Iniciar detecção" e siga o wizard.

**O site no GitHub Pages mostra 404**
→ Verifique se o nome do repositório bate com o `base` no `vite.config.js`. Se o repo se chama `meu-brake-trainer`, altere para `base: '/meu-brake-trainer/'`.

**O gamepad não é detectado no site remoto**
→ O site precisa estar em HTTPS (GitHub Pages já é). Pressione qualquer botão no volante antes de clicar em "Configurar pedais".

**Funciona local mas não no GitHub Pages**
→ Verifique na aba Actions se o build passou. Erros comuns: nome do repo diferente do `base` no vite.config.

---

## Tecnologias

- React 18 + Vite 6
- Gamepad API (browser nativo)
- SVG para gráficos
- localStorage para persistência
- GitHub Actions para CI/CD
