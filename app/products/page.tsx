import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import MobileHeader from "../components/mobile/MobileHeader";
import ProductsView from "./ProductsView";
import { site } from "../site";
import { display, mono, sans } from "./fonts";

export const metadata: Metadata = {
  title: `Products | ${site.name}`,
};

export default function ProductsPage() {
  return (
    <>
      <div className="hidden md:block">
        <SiteHeader />
      </div>
      <MobileHeader />
      <main className={`${display.variable} ${sans.variable} ${mono.variable}`}>
        <ProductsView />
      </main>
    </>
  );
}
