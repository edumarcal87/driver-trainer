import React from 'react';

const container = { maxWidth: 720, width: '100%', margin: '0 auto', padding: '40px 24px', minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' };
const h1Style = { fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8 };
const h2Style = { fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginTop: 28, marginBottom: 8 };
const pStyle = { fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 };
const backBtn = { padding: '6px 14px', fontSize: 11, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-condensed)', fontWeight: 600, textDecoration: 'none' };

export function PrivacyPolicy({ onBack }) {
  return (
    <div style={container}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={onBack} style={backBtn}>← Voltar</button>
      </div>

      <h1 style={h1Style}>Política de Privacidade</h1>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 24 }}>Última atualização: Março de 2026</p>

      <p style={pStyle}>
        A Driver Trainer ("nós", "nosso" ou "aplicação") valoriza a privacidade dos seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos as informações pessoais quando você utiliza nossa plataforma de treino para sim racing, acessível em <strong>www.drivertrainer.com.br</strong>.
      </p>

      <h2 style={h2Style}>1. Informações que coletamos</h2>
      <p style={pStyle}>
        Coletamos as seguintes categorias de informações:
      </p>
      <p style={pStyle}>
        <strong>Dados de conta:</strong> Ao se cadastrar via Google OAuth, coletamos seu nome, endereço de e-mail e foto de perfil fornecidos pelo Google. Não temos acesso à sua senha do Google.
      </p>
      <p style={pStyle}>
        <strong>Dados de uso:</strong> Registramos informações sobre seus exercícios de treino, incluindo scores, tentativas, progresso, badges desbloqueadas e configurações de equipamento (volante, pedais). Esses dados são essenciais para o funcionamento dos recursos de progresso e coaching.
      </p>
      <p style={pStyle}>
        <strong>Dados de pagamento:</strong> Os pagamentos são processados pelo Mercado Pago. Não armazenamos dados de cartão de crédito, débito ou qualquer informação financeira sensível em nossos servidores. Armazenamos apenas o identificador da assinatura para gerenciar seu plano.
      </p>
      <p style={pStyle}>
        <strong>Dados de navegação:</strong> Utilizamos o Google Tag Manager para coletar dados anônimos de uso, como páginas visitadas, exercícios mais praticados e interações com a interface. Esses dados são usados exclusivamente para melhorar a experiência do usuário.
      </p>

      <h2 style={h2Style}>2. Como usamos suas informações</h2>
      <p style={pStyle}>
        Utilizamos suas informações para: fornecer e personalizar os serviços de treino; calcular e exibir seu progresso, rankings e conquistas; processar e gerenciar sua assinatura Premium; enviar comunicações relevantes sobre sua conta; melhorar a plataforma com base em dados agregados de uso; garantir a segurança e integridade da plataforma.
      </p>

      <h2 style={h2Style}>3. Compartilhamento de dados</h2>
      <p style={pStyle}>
        Não vendemos, alugamos ou comercializamos seus dados pessoais. Compartilhamos dados apenas com:
      </p>
      <p style={pStyle}>
        <strong>Supabase:</strong> Nosso provedor de infraestrutura e banco de dados, que armazena seus dados de conta e progresso com criptografia em trânsito e em repouso.
      </p>
      <p style={pStyle}>
        <strong>Google:</strong> Para autenticação via OAuth. Seguimos as políticas de dados de usuário da API do Google.
      </p>
      <p style={pStyle}>
        <strong>Mercado Pago:</strong> Para processamento de pagamentos de assinaturas. Sujeito à política de privacidade do Mercado Pago.
      </p>
      <p style={pStyle}>
        <strong>Google Analytics / Tag Manager:</strong> Para coleta de métricas anônimas de uso.
      </p>

      <h2 style={h2Style}>4. Armazenamento e segurança</h2>
      <p style={pStyle}>
        Seus dados são armazenados em servidores seguros fornecidos pelo Supabase, com criptografia TLS em trânsito e criptografia em repouso. Utilizamos práticas de segurança padrão da indústria, incluindo autenticação via tokens JWT e Row Level Security (RLS) no banco de dados, garantindo que cada usuário acesse apenas seus próprios dados.
      </p>

      <h2 style={h2Style}>5. Seus direitos (LGPD)</h2>
      <p style={pStyle}>
        Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você tem os seguintes direitos: confirmar a existência de tratamento dos seus dados; acessar seus dados pessoais; corrigir dados incompletos, inexatos ou desatualizados; solicitar a anonimização, bloqueio ou eliminação de dados desnecessários; solicitar a portabilidade dos dados; solicitar a eliminação dos dados tratados com consentimento; revogar o consentimento a qualquer momento.
      </p>
      <p style={pStyle}>
        Para exercer qualquer um desses direitos, entre em contato pelo e-mail <strong>privacidade@drivertrainer.com.br</strong>.
      </p>

      <h2 style={h2Style}>6. Cookies e tecnologias similares</h2>
      <p style={pStyle}>
        Utilizamos localStorage do navegador para armazenar preferências locais (tema, configurações de equipamento, histórico de sessão). Utilizamos cookies estritamente necessários para autenticação e gerenciamento de sessão. O Google Tag Manager pode utilizar cookies para fins analíticos.
      </p>

      <h2 style={h2Style}>7. Retenção de dados</h2>
      <p style={pStyle}>
        Seus dados de conta e progresso são mantidos enquanto você tiver uma conta ativa. Se você solicitar a exclusão da conta, seus dados serão removidos em até 30 dias. Dados anônimos e agregados podem ser retidos indefinidamente para fins estatísticos.
      </p>

      <h2 style={h2Style}>8. Menores de idade</h2>
      <p style={pStyle}>
        A Driver Trainer não se destina a menores de 13 anos. Não coletamos intencionalmente dados de menores de 13 anos. Se tomarmos conhecimento de que coletamos dados de um menor, tomaremos medidas para excluir essas informações.
      </p>

      <h2 style={h2Style}>9. Alterações nesta política</h2>
      <p style={pStyle}>
        Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas por meio de um aviso na plataforma ou por e-mail. A data da última atualização será sempre indicada no topo desta página.
      </p>

      <h2 style={h2Style}>10. Contato</h2>
      <p style={pStyle}>
        Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados, entre em contato:
      </p>
      <p style={pStyle}>
        E-mail: <strong>privacidade@drivertrainer.com.br</strong><br />
        Site: <strong>www.drivertrainer.com.br</strong>
      </p>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>© 2026 Driver Trainer. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}

export function TermsOfService({ onBack }) {
  return (
    <div style={container}>
      <div style={{ marginBottom: 24 }}>
        <button onClick={onBack} style={backBtn}>← Voltar</button>
      </div>

      <h1 style={h1Style}>Termos de Uso</h1>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 24 }}>Última atualização: Março de 2026</p>

      <p style={pStyle}>
        Bem-vindo à Driver Trainer. Ao acessar e utilizar nossa plataforma em <strong>www.drivertrainer.com.br</strong>, você concorda com estes Termos de Uso. Por favor, leia-os atentamente.
      </p>

      <h2 style={h2Style}>1. Descrição do serviço</h2>
      <p style={pStyle}>
        A Driver Trainer é uma plataforma web de treino para sim racing que permite aos usuários praticar técnicas de pilotagem (frenagem, aceleração, volante, câmbio) utilizando controladores de jogo (volantes, pedais). O serviço oferece exercícios interativos, análise de desempenho, programas de treino estruturados e integração com dados de telemetria de simuladores.
      </p>

      <h2 style={h2Style}>2. Cadastro e conta</h2>
      <p style={pStyle}>
        Para acessar os recursos completos da plataforma, é necessário criar uma conta utilizando autenticação via Google. Você é responsável por manter a segurança da sua conta e por todas as atividades realizadas sob ela. Você concorda em fornecer informações verdadeiras e manter seus dados atualizados.
      </p>

      <h2 style={h2Style}>3. Planos e pagamentos</h2>
      <p style={pStyle}>
        A Driver Trainer oferece um plano gratuito com funcionalidades básicas e planos Premium (Mensal — R$ 19,90/mês e Anual — R$ 149,90/ano) com funcionalidades avançadas. Os pagamentos são processados pelo Mercado Pago. Ao assinar um plano Premium, você autoriza cobranças recorrentes na frequência escolhida. Você pode cancelar sua assinatura a qualquer momento através da sua conta no Mercado Pago, sem multas ou taxas de cancelamento.
      </p>

      <h2 style={h2Style}>4. Uso permitido</h2>
      <p style={pStyle}>
        Você concorda em utilizar a plataforma apenas para fins legítimos de treino em sim racing. É proibido: manipular scores ou rankings de forma fraudulenta; utilizar bots, scripts ou automação para interagir com a plataforma; tentar acessar contas de outros usuários; utilizar a plataforma para qualquer atividade ilegal.
      </p>

      <h2 style={h2Style}>5. Propriedade intelectual</h2>
      <p style={pStyle}>
        Todo o conteúdo da plataforma, incluindo mas não limitado a textos, gráficos, exercícios, algoritmos de análise, design e código-fonte, é propriedade da Driver Trainer e está protegido por leis de propriedade intelectual. Referências a circuitos (Interlagos, Spa, Monza, Silverstone) e marcas de simuladores são utilizadas para fins descritivos e pertencem aos seus respectivos proprietários.
      </p>

      <h2 style={h2Style}>6. Limitação de responsabilidade</h2>
      <p style={pStyle}>
        A Driver Trainer é uma ferramenta de treino virtual e não substitui treinamento profissional de pilotagem. Não nos responsabilizamos por: decisões tomadas com base nas análises e recomendações da plataforma; indisponibilidade temporária do serviço; perda de dados em circunstâncias excepcionais; incompatibilidade com equipamentos específicos.
      </p>

      <h2 style={h2Style}>7. Disponibilidade do serviço</h2>
      <p style={pStyle}>
        Nos esforçamos para manter a plataforma disponível 24 horas por dia, 7 dias por semana. No entanto, podem ocorrer interrupções para manutenção, atualizações ou por motivos técnicos fora do nosso controle. Não garantimos disponibilidade ininterrupta do serviço.
      </p>

      <h2 style={h2Style}>8. Modificações nos termos</h2>
      <p style={pStyle}>
        Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações significativas serão comunicadas com antecedência por meio da plataforma ou por e-mail. O uso continuado da plataforma após as modificações constitui aceitação dos novos termos.
      </p>

      <h2 style={h2Style}>9. Encerramento</h2>
      <p style={pStyle}>
        Você pode encerrar sua conta a qualquer momento entrando em contato pelo e-mail indicado abaixo. Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos de Uso, sem aviso prévio.
      </p>

      <h2 style={h2Style}>10. Legislação aplicável</h2>
      <p style={pStyle}>
        Estes Termos de Uso são regidos pela legislação brasileira. Qualquer disputa será resolvida no foro da comarca de domicílio do usuário, conforme previsto no Código de Defesa do Consumidor.
      </p>

      <h2 style={h2Style}>11. Contato</h2>
      <p style={pStyle}>
        E-mail: <strong>contato@drivertrainer.com.br</strong><br />
        Site: <strong>www.drivertrainer.com.br</strong>
      </p>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>© 2026 Driver Trainer. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
