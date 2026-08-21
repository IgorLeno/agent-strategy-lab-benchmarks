export interface DayMoment {
  id: string;
  label: string;
  time: string;
  kelvin: string;
  headline: string;
  description: string;
  skyFrom: string;
  skyTo: string;
  glow: string;
  sunY: number;
}

export const dayMoments: DayMoment[] = [
  {
    id: 'morning',
    label: 'Manhã',
    time: '07:00',
    kelvin: '4200K',
    headline: 'Acorde no seu próprio ritmo',
    description:
      'Um branco neutro e crescente imita a luz do amanhecer, sinalizando ao corpo que é hora de despertar sem o choque de uma luz fria e repentina.',
    skyFrom: '#ffd9a0',
    skyTo: '#ff9d6c',
    glow: '#ffb877',
    sunY: 70,
  },
  {
    id: 'focus',
    label: 'Foco',
    time: '11:00',
    kelvin: '6000K',
    headline: 'Clareza para o trabalho que importa',
    description:
      'Um branco frio e intenso, calibrado para reduzir a fadiga visual em tarefas de leitura e tela prolongada, mantendo o alerta mental em alta.',
    skyFrom: '#dff1ff',
    skyTo: '#a6d4ff',
    glow: '#bfe3ff',
    sunY: 18,
  },
  {
    id: 'evening',
    label: 'Entardecer',
    time: '18:30',
    kelvin: '3200K',
    headline: 'A transição que o dia pede',
    description:
      'Tons âmbar quentes reduzem gradualmente a temperatura de cor, acompanhando o pôr do sol e preparando o ambiente para desacelerar.',
    skyFrom: '#ff8a5c',
    skyTo: '#c85a8a',
    glow: '#ff7a59',
    sunY: 55,
  },
  {
    id: 'night',
    label: 'Noite',
    time: '22:00',
    kelvin: '2000K',
    headline: 'Luz que não rouba o seu sono',
    description:
      'Um âmbar profundo e de baixa intensidade, quase sem componente azul, para não interferir na produção natural de melatonina antes de dormir.',
    skyFrom: '#2a1f4d',
    skyTo: '#120c2b',
    glow: '#8a5cff',
    sunY: 92,
  },
];
