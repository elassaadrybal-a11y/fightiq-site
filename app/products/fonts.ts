import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

export const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--fiq-display" });
export const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--fiq-sans" });
export const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--fiq-mono" });
