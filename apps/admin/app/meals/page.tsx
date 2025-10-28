import { createClient } from "@supabase/supabase-js";

export const metadata = { title: "Admin — Meals" };

// Lis les creds dans l'env Codespaces (tu as déjà renseigné les .env)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function MealsAdminPage() {
  // Petit fallback pour continuer même si Supabase n'est pas prêt
  if (!url || !key) {
    return (
      <div>
        <h1>Meals</h1>
        <p style={{color:"#b00"}}>Supabase env manquant — vérifie NEXT_PUBLIC_SUPABASE_URL et SERVICE_ROLE/ANON KEY.</p>
        <p>La page admin est bien servie depuis <b>apps/admin</b> (port 3001).</p>
      </div>
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false }});
  const { data, error } = await supabase.from("meals").select("id,title,is_active,week,day").order("created_at",{ascending:false}).limit(50);

  if (error) {
    return (
      <div>
        <h1>Meals</h1>
        <p style={{color:"#b00"}}>Erreur Supabase: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Meals</h1>
      <table cellPadding={6} style={{ borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ borderBottom:"1px solid #ddd" }}>
            <th align="left">ID</th>
            <th align="left">Titre</th>
            <th>Actif</th>
            <th>Sem</th>
            <th>Jour</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map(m => (
            <tr key={m.id} style={{ borderBottom:"1px solid #eee" }}>
              <td>{m.id}</td>
              <td>{/* @ts-ignore */}
                {m.title}
              </td>
              {/* @ts-ignore */}
              <td align="center">{m.is_active ? "✓" : "–"}</td>
              {/* @ts-ignore */}
              <td align="center">{m.week ?? "-"}</td>
              {/* @ts-ignore */}
              <td align="center">{m.day ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
