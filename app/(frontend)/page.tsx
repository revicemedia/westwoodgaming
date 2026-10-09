import DiscordBreaker from "@/components/DiscordBreaker/DiscordBreaker";
import GameSection from "@/components/GameSection/GameSection";
import HeroSection from "@/components/HeroSection/HeroSection";
import TopSection from "@/components/TopSection/TopSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="w-full h-full bg-white py-20 sm:py-24">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-20 sm:gap-24">
          <TopSection />
          <DiscordBreaker />
          <GameSection />
        </div>
      </div>
    </>
  );
}
