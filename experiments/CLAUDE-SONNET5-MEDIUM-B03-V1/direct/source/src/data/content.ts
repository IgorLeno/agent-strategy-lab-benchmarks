export interface DayMoment {
  id: string;
  label: string;
  time: string;
  kelvin: string;
  kelvinValue: number;
  headline: string;
  description: string;
  colorFrom: string;
  colorTo: string;
  glow: string;
}

export const dayMoments: DayMoment[] = [
  {
    id: 'morning',
    label: 'Morning',
    time: '6:30 – 9:00',
    kelvin: '4000K',
    kelvinValue: 4000,
    headline: 'A sunrise that doesn’t wait for the sun',
    description:
      'LUMA ramps from a dim amber ember to a neutral 4000K wake-up light over twenty minutes, timed to your alarm so your body clock gets a head start on the day.',
    colorFrom: '#ffd9a0',
    colorTo: '#fff6e6',
    glow: '#ffcf8a',
  },
  {
    id: 'focus',
    label: 'Focus',
    time: '9:00 – 17:00',
    kelvin: '6500K',
    kelvinValue: 6500,
    headline: 'Crisp, high-CRI light built for deep work',
    description:
      'A cool 6500K beam with 97 CRI keeps colors true and contrast sharp, so screens, sketches and paperwork all read the way they’re supposed to — no eye strain by hour six.',
    colorFrom: '#cfe8ff',
    colorTo: '#f5fbff',
    glow: '#a9d8ff',
  },
  {
    id: 'evening',
    label: 'Evening',
    time: '17:00 – 21:00',
    kelvin: '2700K',
    kelvinValue: 2700,
    headline: 'A slow fade into warmer territory',
    description:
      'As afternoon turns to evening, LUMA drifts down to a 2700K amber wash and layers in a soft ambient color behind the panel — a visual cue to start winding the workday down.',
    colorFrom: '#ffb168',
    colorTo: '#ffdcb0',
    glow: '#ff9a4d',
  },
  {
    id: 'night',
    label: 'Night',
    time: '21:00 – 23:30',
    kelvin: '1800K',
    kelvinValue: 1800,
    headline: 'Ember-low light that respects your melatonin',
    description:
      'A near-candlelight 1800K glow with blue light cut below 2% keeps the room usable without telling your brain it’s still noon. Presence sensing dims it further the moment you step away.',
    colorFrom: '#ff8a4c',
    colorTo: '#ffb37a',
    glow: '#ff7a33',
  },
];

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const features: Feature[] = [
  {
    id: 'adaptive-white',
    title: 'Adaptive white',
    description:
      'A continuous 1800K–6500K range retunes itself across the day, following a circadian curve instead of a fixed setting.',
    icon: 'sun',
  },
  {
    id: 'ambient-color',
    title: 'Ambient color wash',
    description:
      '16 million colors bloom from the panel’s rear diffuser onto your wall — a quiet backdrop glow, not a disco light.',
    icon: 'palette',
  },
  {
    id: 'presence',
    title: 'Presence sensing',
    description:
      'A radar-grade sensor notices when you sit down or step away and adjusts brightness within half a second — no camera, no wake word.',
    icon: 'radar',
  },
  {
    id: 'focus-mode',
    title: 'One-tap focus mode',
    description:
      'A single press snaps LUMA to a cool, high-CRI focus profile and lights a thin do-not-disturb ring so roommates know not to knock.',
    icon: 'target',
  },
  {
    id: 'app',
    title: 'The LUMA app',
    description:
      'Build scenes, schedule sunrise alarms, and sync brightness across every LUMA on your desk from one lightweight app.',
    icon: 'app',
  },
  {
    id: 'quiet-driver',
    title: 'Whisper-quiet driver',
    description:
      'A flicker-free, fanless driver runs silently at any brightness — no PWM hum, no coil whine, nothing to hear over your keyboard.',
    icon: 'wave',
  },
];

export interface Spec {
  label: string;
  value: string;
}

export interface SpecGroup {
  title: string;
  items: Spec[];
}

export const specGroups: SpecGroup[] = [
  {
    title: 'Light output',
    items: [
      { label: 'Brightness', value: '1,200 lumens max' },
      { label: 'Color temperature', value: '1800K – 6500K, continuously adjustable' },
      { label: 'Color rendering', value: '97 CRI / 95 TM-30' },
      { label: 'Flicker', value: 'Flicker-free, IEEE PAR1789 compliant' },
    ],
  },
  {
    title: 'Dimensions & build',
    items: [
      { label: 'Footprint', value: '150 × 150 mm base' },
      { label: 'Height', value: '420 mm, adjustable arm' },
      { label: 'Weight', value: '890 g' },
      { label: 'Materials', value: 'Machined aluminum, matte-etched glass diffuser' },
    ],
  },
  {
    title: 'Power & connectivity',
    items: [
      { label: 'Power draw', value: '12W typical / 18W max' },
      { label: 'Input', value: 'USB-C, 45W GaN adapter included' },
      { label: 'Wireless', value: 'Wi-Fi 6 (2.4/5GHz), Bluetooth 5.3' },
      { label: 'Voice', value: 'Works with the LUMA app; open Matter support' },
    ],
  },
  {
    title: 'Sensing & warranty',
    items: [
      { label: 'Presence sensor', value: '60GHz mmWave radar, 1.8m range' },
      { label: 'Ambient sensor', value: 'Auto-brightness via onboard lux meter' },
      { label: 'Warranty', value: '3 years, extendable to 5 with LUMA Care' },
      { label: 'In the box', value: 'LUMA lamp, GaN adapter, USB-C cable, quick guide' },
    ],
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'I stopped needing a second coffee at 3pm. The focus profile is the closest thing to a lighting cheat code I’ve found for a home office.',
    name: 'Priya Anand',
    role: 'Product designer, freelance',
  },
  {
    quote:
      'We swapped forty desks in our studio to LUMA during a six-week pilot. Reported eye strain complaints dropped by more than half.',
    name: 'Marcus Feld',
    role: 'Facilities lead, Norrby Studio',
  },
  {
    quote:
      'The evening fade is the feature I didn’t know I needed. It nudges me to log off in a way notifications never managed to.',
    name: 'Sana Okafor',
    role: 'Software engineer',
  },
];

export const pressQuote = {
  quote:
    'LUMA is the rare smart-home object that earns its place on a desk — understated, precise, and genuinely useful across a whole workday.',
  source: 'Dwell Desk Report',
};

export const quantifiedClaim = {
  value: '94%',
  label: 'of beta testers fell asleep faster on nights they used the Evening and Night profiles',
};

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billing: string;
  description: string;
  features: string[];
  cta: string;
  recommended?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'core',
    name: 'LUMA Core',
    price: '$179',
    billing: 'one-time purchase',
    description: 'The full adaptive-light experience in LUMA’s standard aluminum finish.',
    features: [
      'Adaptive white, 1800K–6500K',
      'Presence sensing',
      'LUMA app with scheduling',
      '3-year warranty',
    ],
    cta: 'Order LUMA Core',
  },
  {
    id: 'studio',
    name: 'LUMA Studio',
    price: '$249',
    billing: 'one-time purchase',
    description: 'Adds the ambient color panel and a heavier weighted base for larger desks.',
    features: [
      'Everything in Core',
      'Ambient color wash, 16M colors',
      'Weighted brushed-aluminum base',
      'Second USB-C fast-charge port',
      '3-year warranty',
    ],
    cta: 'Order LUMA Studio',
    recommended: true,
  },
  {
    id: 'studio-care',
    name: 'LUMA Studio + Care',
    price: '$289',
    billing: 'one-time purchase',
    description: 'LUMA Studio bundled with extended coverage and priority replacement.',
    features: [
      'Everything in Studio',
      'Warranty extended to 5 years',
      'Priority next-day replacement',
      'Free annual sensor recalibration',
    ],
    cta: 'Order LUMA Studio + Care',
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: 'How does LUMA know what time of day it is?',
    answer:
      'LUMA syncs to your phone’s timezone the first time you pair it with the app, then runs its adaptive schedule locally on-device — it keeps working even if your Wi-Fi drops.',
  },
  {
    question: 'Can I override the automatic schedule?',
    answer:
      'Yes. Tap any moment in the app — or press the ring on the base — to lock LUMA to a specific color temperature and brightness for as long as you like.',
  },
  {
    question: 'Does the presence sensor use a camera?',
    answer:
      'No. LUMA uses a 60GHz mmWave radar sensor that detects motion and stillness without capturing or storing any image data.',
  },
  {
    question: 'Will LUMA work without the app?',
    answer:
      'Yes. Out of the box LUMA runs its default circadian schedule and responds to the physical dial and button on the base. The app unlocks custom scenes, scheduling and multi-lamp sync.',
  },
  {
    question: 'What’s the difference between LUMA Core and LUMA Studio?',
    answer:
      'Studio adds the ambient color wash panel, a heavier weighted base for stability on larger desks, and a second fast-charge USB-C port. Both share the same adaptive-white engine.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Orders ship within 2 business days from our fulfillment center and typically arrive within 4–7 business days domestically, with tracking sent by email.',
  },
  {
    question: 'What does the warranty cover?',
    answer:
      'All LUMA lamps include a 3-year warranty against manufacturing defects in the driver, sensor and housing. LUMA Care extends that to 5 years and adds priority replacement.',
  },
  {
    question: 'Can I return LUMA if it’s not for me?',
    answer:
      'Yes — every order includes a 45-night home trial. If LUMA isn’t earning its desk space, contact support for a full refund and a prepaid return label.',
  },
];
