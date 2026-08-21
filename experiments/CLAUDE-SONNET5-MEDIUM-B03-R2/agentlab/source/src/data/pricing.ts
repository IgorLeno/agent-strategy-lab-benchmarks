export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'essential',
    name: 'LUMA Essential',
    price: 'R$ 899',
    cadence: 'pagamento único',
    description: 'A luminária completa, sem o anel de cor ambiente. Para quem quer o essencial bem feito.',
    features: [
      'Branco adaptativo 2000K–6500K',
      'Detecção de presença',
      'App LUMA com agendamento',
      'Garantia de 3 anos',
    ],
    cta: 'Comprar Essential',
    highlighted: false,
  },
  {
    id: 'studio',
    name: 'LUMA Studio',
    price: 'R$ 1.249',
    cadence: 'pagamento único',
    description: 'A experiência completa: cor ambiente, sensor de presença de maior alcance e base premium em alumínio.',
    features: [
      'Tudo do plano Essential',
      'Anel de cor ambiente com 16M de cores',
      'Sensor de presença de longo alcance (2 m)',
      'Base em alumínio anodizado',
      'Suporte prioritário por 1 ano',
    ],
    cta: 'Comprar Studio',
    highlighted: true,
  },
  {
    id: 'studio-plus',
    name: 'LUMA Studio+ Care',
    price: 'R$ 1.249 + R$ 39/mês',
    cadence: 'assinatura opcional de cuidado',
    description: 'O Studio com troca prioritária, extensão de garantia vitalícia e cenas exclusivas no app.',
    features: [
      'Tudo do plano Studio',
      'Garantia estendida enquanto a assinatura estiver ativa',
      'Troca expressa em até 48h',
      'Cenas sazonais exclusivas no app',
    ],
    cta: 'Assinar Studio+ Care',
    highlighted: false,
  },
];
