
![alt text](public/logo.svg)

Ferramenta de treino de **freio, acelerador, embreagem, volante e exercícios combinados** para sim racing, com suporte ao **Logitech G29** e importação de telemetria real(em breve).

**[Demo ao vivo →](https://edumarcal87.github.io/driver-trainer/)**

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

## Solução de problemas

**O pedal errado está sendo lido**
→ Vá em "Configurar pedais" → "Iniciar detecção" e siga o wizard.
---
