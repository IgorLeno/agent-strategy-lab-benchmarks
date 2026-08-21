export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface PressQuote {
  quote: string;
  outlet: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'Troquei três luminárias de mesa pela LUMA e nunca mais olhei para trás. A transição para o modo noite sozinha já valeu o investimento no meu sono.',
    name: 'Marina Cardoso',
    role: 'Product designer, trabalha remoto',
  },
  {
    quote:
      'Uso o modo Foco em toda call importante. Meus olhos agradecem depois de oito horas de tela — é a primeira luminária que realmente sinto diferença.',
    name: 'Felipe Andrade',
    role: 'Engenheiro de software',
  },
  {
    quote:
      'A cor ambiente atrás da cúpula transformou meu cantinho de streaming. Parece um setup de estúdio, e configurei tudo em cinco minutos.',
    name: 'Bianca Ferraz',
    role: 'Criadora de conteúdo',
  },
];

export const pressQuotes: PressQuote[] = [
  {
    quote: '"A luminária de mesa mais bem pensada que testamos em anos."',
    outlet: 'Studio Weekly',
  },
  {
    quote: '"LUMA prova que iluminação circadiana não precisa parecer equipamento clínico."',
    outlet: 'Formato Design',
  },
];

export const provenStat = {
  value: '92%',
  label: 'dos usuários reportam adormecer mais rápido nas primeiras duas semanas de uso do modo Noite',
};
