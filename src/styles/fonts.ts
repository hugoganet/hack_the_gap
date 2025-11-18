import localFont from "next/font/local";

export const BrandFont = localFont({
  src: [
    { path: "../../public/fonts/Bangers-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Bangers-Regular.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Bangers-Regular.ttf", weight: "700", style: "normal" }
  ],
  variable: "--font-brand",
  display: "swap",
  preload: true,
});

export default BrandFont;
