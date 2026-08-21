export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export const faqEntries: FaqEntry[] = [
  {
    id: 'setup',
    question: 'Como faço a configuração inicial da LUMA?',
    answer:
      'Conecte o cabo USB-C incluso, abra o app LUMA e siga o pareamento por Bluetooth. Em menos de dois minutos a luminária está na sua rede Wi-Fi e pronta para receber cenas.',
  },
  {
    id: 'no-app',
    question: 'Preciso do app para usar a LUMA no dia a dia?',
    answer:
      'Não. O anel de toque na base controla brilho, temperatura de cor e liga/desliga sem nenhum aplicativo. O app é necessário apenas para agendamentos, cenas de cor e atualizações.',
  },
  {
    id: 'matter',
    question: 'A LUMA funciona com Alexa, Google Home ou Apple Home?',
    answer:
      'Sim. A LUMA fala Matter nativamente, então aparece automaticamente nos três ecossistemas depois do pareamento inicial pelo app, sem hubs adicionais.',
  },
  {
    id: 'eye-safety',
    question: 'A luz da LUMA é segura para uso prolongado?',
    answer:
      'O driver de corrente constante elimina cintilação perceptível e o CRI de 95+ preserva o contraste natural das cores, reduzindo a fadiga ocular em sessões longas de leitura ou tela.',
  },
  {
    id: 'presence-privacy',
    question: 'O sensor de presença grava vídeo ou áudio?',
    answer:
      'Não. O sensor é um radar de baixa energia que detecta apenas movimento e proximidade — não há câmera, microfone nem captura de imagem em nenhum momento.',
  },
  {
    id: 'warranty',
    question: 'O que a garantia de 3 anos cobre?',
    answer:
      'Cobre qualquer defeito de fabricação no driver, LEDs, sensor ou base. No primeiro ano, a troca é direta e sem custo de envio; nos anos seguintes, reparo ou substituição conforme o caso.',
  },
  {
    id: 'power-cut',
    question: 'O que acontece com as cenas se faltar energia?',
    answer:
      'A LUMA guarda a última cena ativa em memória local. Quando a energia volta, ela retoma exatamente o brilho e a temperatura de cor de antes da queda, sem precisar reconfigurar nada.',
  },
  {
    id: 'multiple-units',
    question: 'Posso sincronizar várias unidades de LUMA na mesma casa?',
    answer:
      'Sim. O app agrupa qualquer número de unidades em cenas compartilhadas, então todas as luminárias mudam de momento do dia juntas, ou de forma independente por cômodo.',
  },
];
