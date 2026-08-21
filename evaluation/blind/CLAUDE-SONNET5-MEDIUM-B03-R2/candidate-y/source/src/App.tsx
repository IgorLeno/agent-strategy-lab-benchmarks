import Header from './components/Header';
import Hero from './components/Hero';
import DayCycle from './components/DayCycle';
import Features from './components/Features';
import Specs from './components/Specs';
import SocialProof from './components/SocialProof';
import Pricing from './components/Pricing';
import Faq from './components/Faq';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <DayCycle />
        <Features />
        <Specs />
        <SocialProof />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
