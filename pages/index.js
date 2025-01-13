import Image from "next/image";
import Link from "next/link";
import { Logo } from "../components/Logo/Logo";
import HeroImage from "../public/hero.webp";

export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center relative">
      <Image src={HeroImage} alt="Hero" fill className="absolute" />
      <div className="relative z-1 text-white px-5 pb-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-sm">
        <Logo />
        <p>
          The AI-powered SAAS solution to generate SEO-optimized blog posts in
          minutes. Get high-quality content, without sacrificing your time.
        </p>
        <Link href="/post/new" className="btn mt-2">
          Begin
        </Link>
      </div>
    </div>
  );
}
