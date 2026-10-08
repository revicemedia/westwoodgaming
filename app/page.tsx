import GameSection from "@/components/GameSection/GameSection";
import HeroSection from "@/components/HeroSection/HeroSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="w-full h-full bg-white py-20">
        <div className="w-full max-w-7xl mx-auto">
          <GameSection />
        </div>
      </div>
    </>
  );
}
