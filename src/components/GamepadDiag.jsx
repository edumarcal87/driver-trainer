import React, { useState, useEffect } from 'react';

export default function GamepadDiag() {
  const [gpInfo, setGpInfo] = useState(null);
  const [axes, setAxes] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [axesMin, setAxesMin] = useState([]);
  const [axesMax, setAxesMax] = useState([]);

  useEffect(() => {
    const poll = setInterval(() => {
      const gps = navigator.getGamepads();
      for (const gp of gps) {
        if (!gp) continue;
        setGpInfo({ id: gp.id, axes: gp.axes.length, buttons: gp.buttons.length, mapping: gp.mapping });
        const a = [...gp.axes];
        setAxes(a);
        setButtons(gp.buttons.map((b, i) => ({ i, pressed: b.pressed, value: b.value })));
        
        setAxesMin(prev => {
          const n = [...prev];
          while (n.length < a.length) n.push(Infinity);
          a.forEach((v, i) => { n[i] = Math.min(n[i], v); });
          return n;
        });
        setAxesMax(prev => {
          const n = [...prev];
          while (n.length < a.length) n.push(-Infinity);
          a.forEach((v, i) => { n[i] = Math.max(n[i], v); });
          return n;
        });
        return;
      }
      setGpInfo(null);
    }, 30);
    return () => clearInterval(poll);
  }, []);

  const resetMinMax = () => {
    setAxesMin(axes.map(() => Infinity));
    setAxesMax(axes.map(() => -Infinity));
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20, fontFamily: 'monospace', fontSize: 13 }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Gamepad Diagnostic</h1>
      
      {!gpInfo ? (
        <p style={{ color: 'red', padding: 20 }}>
          Nenhum gamepad detectado. Conecte o G29 via USB e pressione qualquer botão.
        </p>
      ) : (
        <>
          <div style={{ background: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <p><strong>ID:</strong> {gpInfo.id}</p>
            <p><strong>Mapping:</strong> {gpInfo.mapping || '(none)'}</p>
            <p><strong>Eixos:</strong> {gpInfo.axes} | <strong>Botões:</strong> {gpInfo.buttons}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 16 }}>Eixos ({axes.length})</h2>
            <button onClick={resetMinMax} style={{ padding: '4px 12px', fontSize: 12 }}>Reset Min/Max</button>
          </div>
          
          <p style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
            Instruções: Pise em cada pedal individualmente e observe qual eixo muda. 
            Anote o número do eixo, valor solto e valor pressionado para cada pedal.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={th}>Eixo</th>
                <th style={th}>Valor Atual</th>
                <th style={th}>Min Registrado</th>
                <th style={th}>Max Registrado</th>
                <th style={th}>Range</th>
                <th style={th}>Barra</th>
              </tr>
            </thead>
            <tbody>
              {axes.map((v, i) => {
                const mn = axesMin[i] ?? v;
                const mx = axesMax[i] ?? v;
                const range = mx - mn;
                const isActive = range > 0.1;
                return (
                  <tr key={i} style={{ background: isActive ? '#fffde0' : 'transparent' }}>
                    <td style={td}><strong>Eixo {i}</strong></td>
                    <td style={{ ...td, color: isActive ? '#c00' : '#333', fontWeight: isActive ? 'bold' : 'normal' }}>
                      {v.toFixed(4)}
                    </td>
                    <td style={td}>{mn.toFixed(4)}</td>
                    <td style={td}>{mx.toFixed(4)}</td>
                    <td style={{ ...td, fontWeight: 'bold', color: range > 0.5 ? '#080' : '#666' }}>
                      {range.toFixed(3)}
                    </td>
                    <td style={{ ...td, width: 150 }}>
                      <div style={{ width: 140, height: 12, background: '#ddd', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                          position: 'absolute', left: `${((v + 1) / 2) * 100}%`,
                          top: 0, width: 3, height: 12, background: isActive ? '#e74c3c' : '#999',
                          transform: 'translateX(-50%)',
                        }} />
                        {/* Center mark */}
                        <div style={{
                          position: 'absolute', left: '50%', top: 0, width: 1, height: 12,
                          background: '#00000030', transform: 'translateX(-50%)',
                        }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Botões pressionados</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {buttons.filter(b => b.pressed || b.value > 0.05).map(b => (
              <span key={b.i} style={{
                padding: '3px 10px', borderRadius: 6, fontSize: 11,
                background: '#e74c3c', color: '#fff',
              }}>
                Btn {b.i} ({b.value.toFixed(2)})
              </span>
            ))}
            {buttons.every(b => !b.pressed && b.value <= 0.05) && (
              <span style={{ color: '#999' }}>Nenhum botão pressionado</span>
            )}
          </div>

          <div style={{ marginTop: 24, padding: 16, background: '#f8f8f0', borderRadius: 8, border: '1px solid #ddd' }}>
            <h3 style={{ fontSize: 14, marginBottom: 8 }}>Como usar:</h3>
            <ol style={{ fontSize: 12, lineHeight: 1.8, paddingLeft: 20 }}>
              <li>Clique "Reset Min/Max"</li>
              <li>Pise SOMENTE no freio até o fundo e solte — anote qual eixo ficou amarelo e com range alto</li>
              <li>Clique "Reset Min/Max" novamente</li>
              <li>Pise SOMENTE no acelerador até o fundo e solte — anote o eixo</li>
              <li>Repita para embreagem e volante</li>
              <li>Tire um screenshot desta tela e me envie!</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}

const th = { padding: '6px 8px', textAlign: 'left', fontSize: 11, borderBottom: '1px solid #ccc' };
const td = { padding: '5px 8px', borderBottom: '1px solid #eee', fontSize: 12 };
