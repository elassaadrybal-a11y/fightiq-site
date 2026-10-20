import PhoneScroll from "./components/PhoneScroll";
import MobileLanding from "./components/mobile/MobileLanding";
import SiteHeader from "./components/SiteHeader";

export default function Home() {
  return (
    <>
      <div className="hidden md:block">
        <SiteHeader />
      </div>
      <main>
        <div id="top">
          <div className="hidden md:block">
            <PhoneScroll />
          </div>
          <div className="md:hidden">
            <MobileLanding />
          </div>
        </div>
      </main>
    </>
  );
}
