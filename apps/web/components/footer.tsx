export default function Footer(){
  return (
    <footer className="border-t bg-white">
      <div className="container grid gap-6 py-8 md:grid-cols-3">
        <div>
          <div className="text-lg font-bold mb-2">Fitnest</div>
          <p className="text-sm text-gray-600">Repas sains livrés, adaptés à vos objectifs.</p>
        </div>
        <div>
          <div className="font-semibold">Navigation</div>
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            <a href="/plans" className="text-gray-700 hover:text-fitnest-green">Meal Plans</a>
            <a href="/menu" className="text-gray-700 hover:text-fitnest-green">Meals</a>
            <a href="/catalogue" className="text-gray-700 hover:text-fitnest-green">How It Works</a>
            <a href="/subscribe" className="text-gray-700 hover:text-fitnest-green">Subscribe</a>
          </div>
        </div>
        <div>
          <div className="font-semibold">Légal</div>
          <div className="grid gap-2 text-sm mt-2">
            <a href="#" className="text-gray-700 hover:text-fitnest-green">CGU</a>
            <a href="#" className="text-gray-700 hover:text-fitnest-green">Confidentialité</a>
            <a href="#" className="text-gray-700 hover:text-fitnest-green">Mentions légales</a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-3 text-xs text-gray-500">© {new Date().getFullYear()} Fitnest</div>
      </div>
    </footer>
  );
}
