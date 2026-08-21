import { DayCycle } from './components/DayCycle';
import { FAQ } from './components/FAQ';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Pricing } from './components/Pricing';
import { SocialProof } from './components/SocialProof';
import { Specs } from './components/Specs';

export default function App() {
  return (
    <div className="page">
      <a className="skip-link" href="#hero">
        Pular para o conteúdo
      </a>
      <Header />
      <main>
        <Hero />
        <DayCycle />
        <Features />
        <Specs />
        <SocialProof />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
