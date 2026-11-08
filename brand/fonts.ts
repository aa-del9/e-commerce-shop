import { Geist, Geist_Mono } from "next/font/google";

// next/font self-hosts these at build time. brand/theme.css reads the two CSS variables below.
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-brand-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-brand-mono",
});

export const fontVariables = `${sans.variable} ${mono.variable}`;
