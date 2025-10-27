import "./globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export const metadata = { title:"Fitnest", description:"Repas sains livrés" };

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="fr">
      <body>
        <NavBar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
