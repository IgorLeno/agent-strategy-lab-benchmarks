export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: 'sun' | 'motion' | 'wave' | 'app' | 'eye' | 'leaf';
}

export const features: Feature[] = [
  {
    id: 'adaptive-white',
    title: 'Branco adaptativo',
    description:
      'De 2000K a 6500K em transições contínuas, a LUMA acompanha a curva natural da luz do dia em vez de forçar um único tom sobre a sua mesa.',
    icon: 'sun',
  },
  {
    id: 'presence',
    title: 'Detecção de presença',
    description:
      'Um sensor de proximidade de baixa energia liga a luz quando você senta e a atenua sozinha depois de alguns minutos de ausência.',
    icon: 'motion',
  },
  {
    id: 'ambient-color',
    title: '16 milhões de cores ambiente',
    description:
      'Um segundo anel de LED RGB projeta cor indireta atrás da cúpula, para chamadas de vídeo, jogos ou simplesmente clima.',
    icon: 'wave',
  },
  {
    id: 'app-control',
    title: 'App LUMA',
    description:
      'Agende cenas, sincronize com o nascer e o pôr do sol da sua cidade e crie atalhos com um toque, direto do seu telefone.',
    icon: 'app',
  },
  {
    id: 'flicker-free',
    title: 'Driver sem cintilação',
    description:
      'Um driver de corrente constante elimina o flicker perceptível e imperceptível, reduzindo a fadiga ocular em sessões longas.',
    icon: 'eye',
  },
  {
    id: 'low-power',
    title: 'Eficiência energética',
    description:
      'Consumo máximo de 9W com saída de até 750 lúmens: mais luz útil por watt do que uma luminária incandescente equivalente.',
    icon: 'leaf',
  },
];
