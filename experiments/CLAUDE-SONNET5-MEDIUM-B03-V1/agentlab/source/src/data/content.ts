export interface DayStage {
  id: string;
  label: string;
  time: string;
  title: string;
  description: string;
  warm: number;
  cool: number;
  glow: string;
}

export const DAY_STAGES: DayStage[] = [
  {
    id: 'morning',
    label: 'Manhã',
    time: '06:30',
    title: 'Um amanhecer que acompanha o seu',
    description:
      'LUMA sobe de 2700K a 4000K em passos suaves, imitando a luz do sol nascente para destravar o seu relógio biológico sem o choque de um teto acendendo de uma vez.',
    warm: 92,
    cool: 18,
    glow: '#ffb26b',
  },
  {
    id: 'focus',
    label: 'Foco',
    time: '10:00',
    title: 'Luz branca e neutra para atenção sustentada',
    description:
      'Em modo Foco, a temperatura sobe para 5500K com CRI 97, reduzindo a fadiga visual em sessões longas de leitura, código ou trabalho detalhado.',
    warm: 35,
    cool: 95,
    glow: '#a8d8ff',
  },
  {
    id: 'evening',
    label: 'Entardecer',
    time: '18:30',
    title: 'A transição que avisa o corpo que o dia está terminando',
    description:
      'A partir das 18h, LUMA reduz gradualmente a intensidade e desloca a cor para tons âmbar, sinalizando ao cérebro que é hora de desacelerar.',
    warm: 78,
    cool: 30,
    glow: '#ff9457',
  },
  {
    id: 'night',
    label: 'Noite',
    time: '22:15',
    title: 'Presença sem interromper o sono',
    description:
      'O sensor de presença ativa apenas um brilho âmbar mínimo quando você se aproxima da mesa — o suficiente para enxergar, pouco o bastante para não acordar de vez.',
    warm: 40,
    cool: 6,
    glow: '#c8672f',
  },
];

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: 'sun' | 'palette' | 'presence' | 'app';
}

export const FEATURES: Feature[] = [
  {
    id: 'adaptive-white',
    title: 'Branco adaptativo',
    description:
      'De 2700K a 6500K em transições contínuas, calibradas por hora do dia ou ajustadas manualmente em segundos.',
    icon: 'sun',
  },
  {
    id: 'ambient-color',
    title: 'Cor ambiente',
    description:
      '16 milhões de cores para leitura noturna, videochamadas ou apenas para combinar com o seu humor.',
    icon: 'palette',
  },
  {
    id: 'presence-sensing',
    title: 'Detecção de presença',
    description:
      'Um radar de baixa energia percebe quando você chega e quando sai, acendendo e apagando sem um único toque.',
    icon: 'presence',
  },
  {
    id: 'app-control',
    title: 'Controle pelo app',
    description:
      'Agende rotinas, crie cenas e sincronize LUMA com o seu calendário direto do aplicativo LUMA, no telefone ou no desktop.',
    icon: 'app',
  },
];

export interface Spec {
  label: string;
  value: string;
}

export const SPECS: Spec[] = [
  { label: 'Dimensões', value: '52 × 18 × 34 cm (altura ajustável)' },
  { label: 'Fluxo luminoso', value: '1.200 lúmens no máximo' },
  { label: 'Índice de reprodução de cor', value: 'CRI 97+' },
  { label: 'Temperatura de cor', value: '2.700K – 6.500K contínuo' },
  { label: 'Potência', value: '14W típico, 22W no pico' },
  { label: 'Conectividade', value: 'Wi-Fi 2,4GHz, Bluetooth 5.2, Matter' },
  { label: 'Materiais', value: 'Alumínio usinado e policarbonato difusor' },
  { label: 'Garantia', value: '3 anos, com troca antecipada' },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Troquei três luminárias de escritório por uma LUMA. É a primeira luz que meus olhos não notam depois de oito horas de tela.',
    name: 'Marina Kessler',
    role: 'Diretora de produto, Voss Studio',
  },
  {
    quote:
      'O modo Foco virou parte da minha rotina de escrita. Fecho o dia sem a dor de cabeça que a luz do teto sempre causava.',
    name: 'Thiago Andrade',
    role: 'Escritor e roteirista',
  },
  {
    quote:
      'A curva de amanhecer substituiu meu despertador. Acordo antes do alarme tocar, e isso nunca tinha acontecido antes.',
    name: 'Priya Shah',
    role: 'Engenheira de software, Nimbus Labs',
  },
];

export const QUANTIFIED_CLAIM = {
  value: '94%',
  description: 'dos usuários relatam menos fadiga visual após duas semanas de uso, em pesquisa interna com 1.240 clientes.',
};

export const PRESS_QUOTES = [
  { outlet: 'Desk & Light Review', quote: '"A luminária de escritório mais bem pensada do ano."' },
  { outlet: 'Studio Notes', quote: '"Design de objeto, engenharia de laboratório de sono."' },
];

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  recommended?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'standard',
    name: 'LUMA',
    price: 'R$ 1.290',
    period: 'pagamento único',
    description: 'A luminária completa: branco adaptativo, cor ambiente, presença e app.',
    features: [
      'Corpo em alumínio usinado',
      'Sensor de presença integrado',
      'App LUMA com rotinas ilimitadas',
      'Garantia de 3 anos',
    ],
    cta: 'Comprar LUMA',
  },
  {
    id: 'studio',
    name: 'LUMA Studio',
    price: 'R$ 1.690',
    period: 'pagamento único',
    description: 'LUMA mais o difusor Studio e o suporte de parede, para quem monta o setup definitivo.',
    features: [
      'Tudo do plano LUMA',
      'Difusor Studio de área ampliada',
      'Suporte de parede articulado',
      'Instalação assistida por vídeo',
      'Garantia de 3 anos com troca antecipada',
    ],
    cta: 'Comprar LUMA Studio',
    recommended: true,
  },
  {
    id: 'membership',
    name: 'LUMA + Care',
    price: 'R$ 1.290 + R$ 29/mês',
    period: 'assinatura Care opcional',
    description: 'A LUMA padrão com substituição prioritária e cenas premium desenvolvidas mensalmente.',
    features: [
      'Tudo do plano LUMA',
      'Substituição prioritária em 48h',
      'Cenas de luz premium mensais',
      'Suporte por chat com resposta em minutos',
    ],
    cta: 'Assinar com Care',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'A LUMA funciona sem o aplicativo?',
    answer:
      'Sim. A base tem um dimmer capacitivo para brilho e temperatura, então tudo funciona direto no aparelho. O app adiciona rotinas, cenas de cor e o sensor de presença configurável.',
  },
  {
    question: 'Preciso de um hub para usar o sensor de presença?',
    answer:
      'Não. O radar de presença é integrado ao corpo da luminária e funciona por Wi-Fi direto com o app, sem hub adicional.',
  },
  {
    question: 'A LUMA é compatível com Matter, HomeKit ou Google Home?',
    answer:
      'A LUMA fala Matter nativamente, então funciona com HomeKit, Google Home e Alexa via Matter, além do app próprio.',
  },
  {
    question: 'Quanto tempo dura a curva de amanhecer?',
    answer:
      'Por padrão a transição dura 30 minutos, mas você pode configurar de 10 a 60 minutos no app, ou desativar completamente.',
  },
  {
    question: 'Qual a diferença entre LUMA e LUMA Studio?',
    answer:
      'O Studio adiciona o difusor de área ampliada, que suaviza ainda mais as sombras em mesas de desenho e fotografia, além do suporte de parede articulado.',
  },
  {
    question: 'Como funciona a garantia de 3 anos?',
    answer:
      'Qualquer defeito de fabricação é coberto por 3 anos. Assinantes do plano Care recebem substituição prioritária em até 48 horas, sem custo de envio.',
  },
  {
    question: 'A LUMA consome muita energia deixada ligada o dia todo?',
    answer:
      'Não. O consumo típico é de 14W, similar a uma lâmpada de LED comum, e o sensor de presença reduz o brilho automaticamente quando você se afasta.',
  },
  {
    question: 'Posso usar mais de uma LUMA sincronizada?',
    answer:
      'Sim, o app permite agrupar quantas unidades você quiser em uma mesma cena, sincronizando cor, brilho e transições entre todas.',
  },
];

export interface FooterLinkGroup {
  title: string;
  links: string[];
}

export const FOOTER_GROUPS: FooterLinkGroup[] = [
  { title: 'Produto', links: ['Recursos', 'Especificações', 'Planos', 'Aplicativo'] },
  { title: 'Empresa', links: ['Sobre', 'Imprensa', 'Carreiras', 'Contato'] },
  { title: 'Suporte', links: ['Central de ajuda', 'Garantia', 'Status', 'Comunidade'] },
];
