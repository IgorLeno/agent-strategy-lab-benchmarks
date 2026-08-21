// Copy and structured content for the LUMA landing page. Kept separate from
// components so the JSX stays focused on structure/markup.

export interface DayMoment {
  id: 'morning' | 'focus' | 'evening' | 'night';
  label: string;
  time: string;
  kelvin: string;
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
    time: '6:30 AM',
    kelvin: '5000K',
    headline: 'A cool wake-up light that mimics the sky.',
    description:
      'LUMA opens with a crisp, blue-leaning white that signals your body to stop producing melatonin — no alarm shock, just a gradual rise that mirrors sunrise.',
    colorFrom: '#eaf3ff',
    colorTo: '#8fb8ff',
    glow: '#bcd4ff',
  },
  {
    id: 'focus',
    label: 'Focus',
    time: '11:00 AM',
    kelvin: '4200K',
    headline: 'Neutral white, tuned for concentration.',
    description:
      'Midday brightness climbs to 1,100 lumens of neutral white light, matched to daylight-balanced CRI 97 so screens, paper and skin tones all read true.',
    colorFrom: '#ffffff',
    colorTo: '#d9e4ff',
    glow: '#e7edff',
  },
  {
    id: 'evening',
    label: 'Evening',
    time: '6:30 PM',
    kelvin: '2700K',
    headline: 'Warm amber that eases the day down.',
    description:
      'As afternoon fades, LUMA drifts toward a candle-warm 2700K glow, dimming gradually so the transition from work to rest feels earned, not abrupt.',
    colorFrom: '#ffd9a0',
    colorTo: '#ff9d4d',
    glow: '#ffc47a',
  },
  {
    id: 'night',
    label: 'Night',
    time: '10:00 PM',
    kelvin: '1800K',
    headline: 'A low amber ember, almost blue-free.',
    description:
      'The last hour before sleep, LUMA falls to a near-ember 1800K at 4% brightness — enough to read a spine by, with negligible blue light to disturb sleep onset.',
    colorFrom: '#ff9a5c',
    colorTo: '#8a3a1e',
    glow: '#c9601f',
  },
];

export interface Feature {
  title: string;
  description: string;
  icon: 'spectrum' | 'presence' | 'app' | 'quiet' | 'cable' | 'palette';
}

export const features: Feature[] = [
  {
    title: 'Adaptive white spectrum',
    description:
      'LUMA continuously shifts color temperature from 1800K to 6500K across the day, following a curve you can tune or leave on its default circadian profile.',
    icon: 'spectrum',
  },
  {
    title: 'Presence-aware dimming',
    description:
      'A millimeter-wave sensor detects when you sit down or step away, fading the light in over two seconds and dimming to standby after you leave — no PIR blind spot, no false triggers.',
    icon: 'presence',
  },
  {
    title: '16 million ambient colors',
    description:
      'Beyond white light, the base ring casts a soft accent color onto your desk — sync it to an album cover, a Pomodoro timer, or your calendar status.',
    icon: 'palette',
  },
  {
    title: 'One companion app',
    description:
      'Set schedules, name scenes, and group multiple LUMAs into a room. Everything syncs over Thread and Wi-Fi, and works locally if your router goes down.',
    icon: 'app',
  },
  {
    title: 'Whisper-quiet electronics',
    description:
      'A fanless aluminum body dissipates heat passively. No coil whine, no driver hum — measured under 3dB at typical listening distance.',
    icon: 'quiet',
  },
  {
    title: 'One-cable design',
    description:
      'A single braided USB-C cable carries both power and firmware updates. No hub, no proprietary dock, no battery to replace in five years.',
    icon: 'cable',
  },
];

export interface Spec {
  label: string;
  value: string;
}

export const specs: Spec[] = [
  { label: 'Dimensions', value: '148 × 210 × 340 mm (base to head)' },
  { label: 'Weight', value: '890 g, weighted cast-zinc base' },
  { label: 'Light output', value: '1,100 lumens max, 4–100% dimming' },
  { label: 'Color rendering', value: 'CRI 97, R9 > 90' },
  { label: 'Color temperature', value: '1800K – 6500K, tunable white' },
  { label: 'Ambient color ring', value: '16.7M colors, 500 nits' },
  { label: 'Power', value: '18W USB-C PD, cable included' },
  { label: 'Connectivity', value: 'Wi-Fi 6, Thread, Bluetooth 5.3' },
  { label: 'Sensing', value: '60GHz mmWave presence, 1.8 m range' },
  { label: 'Materials', value: 'CNC aluminum head, cast-zinc base' },
  { label: 'App platforms', value: 'iOS 16+, Android 11+, web dashboard' },
  { label: 'Warranty', value: '3-year limited, 30-day home trial' },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "I've replaced three desk lamps with one LUMA. The evening wind-down curve alone changed how I sleep after late work sessions.",
    name: 'Priya Nandakumar',
    role: 'Product designer, remote',
  },
  {
    quote:
      'We outfitted 40 desks in our studio with LUMA. Presence dimming quietly cut our lighting power draw by a third.',
    name: 'Marcus Ohlin',
    role: 'Studio manager, Ohlin & Vale Architects',
  },
  {
    quote:
      'The CRI is the real deal — first desk light I trust for color-accurate print proofing without a second monitor light.',
    name: 'Dana Whitfield',
    role: 'Freelance photo retoucher',
  },
];

export const pressQuote = {
  quote:
    'The most thoughtfully engineered desk light we tested this year — LUMA treats circadian lighting as a feature, not a gimmick.',
  publication: 'Ambient Review',
};

export const quantifiedClaim = '94% of beta testers reported falling asleep faster within two weeks of nightly use.';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  featured?: boolean;
  features: string[];
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'luma',
    name: 'LUMA',
    price: '$189',
    cadence: 'one-time',
    description: 'The full experience on a single desk.',
    features: [
      'Adaptive white + ambient color',
      'Presence-aware dimming',
      'Companion app, unlimited scenes',
      '3-year warranty',
    ],
    cta: 'Pre-order LUMA',
  },
  {
    id: 'luma-studio',
    name: 'LUMA Studio',
    price: '$349',
    cadence: 'one-time',
    description: 'Two lamps, synced, for dual-monitor and shared desks.',
    featured: true,
    features: [
      'Everything in LUMA, ×2 lamps',
      'Auto-paired scenes across both lamps',
      'Priority firmware access',
      '3-year warranty + free shade swap',
    ],
    cta: 'Pre-order Studio',
  },
  {
    id: 'luma-pro',
    name: 'LUMA Pro',
    price: '$449',
    cadence: 'one-time',
    description: 'For studios and offices: mounting arm and fleet management.',
    features: [
      'Everything in LUMA',
      'Articulating desk-clamp arm',
      'Multi-room fleet controls in-app',
      '5-year warranty, on-site swap',
    ],
    cta: 'Pre-order Pro',
  },
];

export interface FaqEntry {
  question: string;
  answer: string;
}

export const faqEntries: FaqEntry[] = [
  {
    question: 'How does LUMA know what time of day it is?',
    answer:
      'LUMA syncs to your phone or Wi-Fi network for local time and, if you allow it, your approximate location for sunrise/sunset — no account or GPS chip required. You can also override the schedule manually at any time.',
  },
  {
    question: 'Does the presence sensor use a camera?',
    answer:
      'No. LUMA uses a 60GHz millimeter-wave radar sensor, the same category used in some smart thermostats. It detects motion and breathing-level micro-movement, not images, and nothing is recorded or sent to the cloud.',
  },
  {
    question: 'Can I use LUMA without the app?',
    answer:
      'Yes. A capacitive ring on the base controls brightness, color temperature, and ambient color directly. The app adds scheduling, scenes, and multi-lamp sync, but LUMA works fully offline out of the box.',
  },
  {
    question: 'What is the difference between LUMA and LUMA Studio?',
    answer:
      'LUMA Studio includes two lamps pre-paired to run synchronized scenes — ideal for dual-monitor setups or shared desks. Everything else, including warranty length, matches the single LUMA.',
  },
  {
    question: 'How long does shipping take?',
    answer:
      'Pre-orders placed today ship within 3–4 weeks. Every order includes tracked shipping and a 30-day home trial: return it for a full refund if it is not the right fit.',
  },
  {
    question: 'Is LUMA compatible with other smart home platforms?',
    answer:
      'LUMA speaks Thread and Matter, so it works alongside Apple Home, Google Home, and Amazon Alexa without a separate bridge. Wi-Fi and Bluetooth remain available as fallbacks.',
  },
  {
    question: 'What happens if my Wi-Fi goes down?',
    answer:
      'Schedules and scenes are stored on-device, so LUMA keeps following its daily curve with no network at all. Only remote control and firmware updates require connectivity.',
  },
];
