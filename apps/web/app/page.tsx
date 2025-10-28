export const metadata = { title:"Fitnest — Home" };
export default function Home(){
  return (
    <div className="container py-10 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Mangez mieux. Gagnez du temps.</h1>
      <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
        Repas équilibrés, frais chaque jour. Plans adaptés à la perte de poids, maintien ou prise de masse.
      </p>
      <div className="mt-4 flex gap-3 justify-center">
        <a href="/subscribe" className="rounded-md bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">Je m’abonne</a>
        <a href="/catalogue" className="rounded-md border px-4 py-2 text-sm hover:border-fitnest-green hover:text-fitnest-green">Découvrir l’offre</a>
      </div>
    </div>
  );
}
