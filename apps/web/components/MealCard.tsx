type Props = {
  title: string;
  meal_type?: string;
  calories?: number|null;
  protein_g?: number|null;
  carbs_g?: number|null;
  fat_g?: number|null;
  image_url?: string|null;
};
export default function MealCard(p: Props){
  return (
    <article className="card" style={{overflow:"hidden"}}>
      {p.image_url ? (
        // Simple <img> sans next/image pour aller vite
        <img src={p.image_url} alt={p.title} style={{width:"100%",height:160,objectFit:"cover"}} />
      ) : (
        <div style={{height:160, background:"#f3f3f3"}} />
      )}
      <div style={{padding:12}}>
        <div style={{fontSize:14, fontWeight:600, opacity:.7}}>{p.meal_type}</div>
        <div style={{fontWeight:700, margin:"2px 0 6px"}}>{p.title}</div>
        <div className="label" style={{display:"flex", gap:12}}>
          {p.calories!=null && <span>{p.calories} kcal</span>}
          {p.protein_g!=null && <span>Prot {p.protein_g}g</span>}
          {p.carbs_g!=null && <span>Gluc {p.carbs_g}g</span>}
          {p.fat_g!=null && <span>Lip {p.fat_g}g</span>}
        </div>
      </div>
    </article>
  );
}
