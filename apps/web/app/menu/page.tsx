export const metadata = { title: "Fitnest — Menu" };
const ITEMS = [
  { title: "Omelette protéines", type:"Breakfast" },
  { title: "Bowl poulet & quinoa", type:"Lunch" },
  { title: "Saumon & légumes rôtis", type:"Dinner" },
  { title: "Overnight oats", type:"Breakfast" },
  { title: "Bowl boeuf & riz", type:"Lunch" },
  { title: "Pâtes complètes & dinde", type:"Dinner" },
];
export default function MenuPage(){
  return (
    <main style={{maxWidth:1100, margin:"0 auto", padding:"32px 16px"}}>
      <h1 style={{fontSize:32, marginBottom:16}}>Menu</h1>
      <p style={{opacity:.85, marginTop:0}}>Exemples de repas servis selon votre plan (images à remplacer).</p>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16}}>
        {ITEMS.map((it, i)=>(
          <div key={i} style={{border:"1px solid #eee", borderRadius:12, overflow:"hidden"}}>
            <div style={{height:140, background:"#fafafa", display:"grid", placeItems:"center"}}>Image</div>
            <div style={{padding:12}}>
              <div style={{fontWeight:600}}>{it.title}</div>
              <div style={{opacity:.7, fontSize:12}}>{it.type}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
