import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteWatermark } from "@/components/layout/SiteWatermark";
import "./globals.css";

const geist=Geist({variable:"--font-geist-sans",subsets:["latin"]});
export const metadata:Metadata={title:{default:"FC PPB | Futsal Plzeň",template:"%s | FC PPB"},description:"Oficiální web futsalového klubu FC PPB Plzeň.",metadataBase:new URL("https://fcppb.cz"),openGraph:{title:"FC PPB | Futsal Plzeň",description:"Přátelství. Pokora. Bojovnost. Spojuje nás víc než hra.",url:"https://fcppb.cz",siteName:"FC PPB",locale:"cs_CZ",type:"website"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="cs" className={geist.variable}><body><Header/><SiteWatermark/><div className="site-content">{children}</div><Footer/></body></html>}
