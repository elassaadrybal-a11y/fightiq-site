import type { Metadata } from "next";
import MobileHeader from "../components/mobile/MobileHeader";
import PhoneScroll from "../components/PhoneScroll";
import AppScreens from "./AppScreens";
import { site } from "../site";

export const metadata: Metadata = {
  title: `The App | ${site.name}`,
};

export default function TheAppPage() {
  return (
    <>
      <MobileHeader />
      <main className="bg-black">
        <div className="hidden md:block">
          <PhoneScroll />
        </div>
        <div className="md:hidden">
          <AppScreens />
        </div>
      </main>
    </>
  );
}
