import { Link } from "expo-router";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import { colors, radius, space } from "../lib/theme";

export default function Home() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.hero}>Mange sainement,{"\n"}sans y penser.</Text>
      <Text style={styles.sub}>
        Des repas equilibres, livres a Casablanca. Choisis un programme pret ou
        compose tes propres plats.
      </Text>

      <Link href="/plans" asChild>
        <Pressable style={[styles.card, styles.cardPrimary]}>
          <Text style={styles.cardTitle}>Nos programmes</Text>
          <Text style={styles.cardBody}>
            Weight Loss, Muscle Gain et plus — prix calcules automatiquement.
          </Text>
        </Pressable>
      </Link>

      <Link href="/compose" asChild>
        <Pressable style={[styles.card, styles.cardAccent]}>
          <Text style={styles.cardTitle}>Compose ton plan</Text>
          <Text style={styles.cardBody}>
            Construis ton plat a la portion, vois les macros et le prix en direct.
          </Text>
        </Pressable>
      </Link>

      <Text style={styles.note}>
        Prototype — connecte a l&apos;API publique de fitnest.ma.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, gap: space.md },
  hero: { fontSize: 30, fontWeight: "800", color: colors.text, marginTop: space.md },
  sub: { fontSize: 15, color: colors.muted, lineHeight: 22, marginBottom: space.sm },
  card: { borderRadius: radius.lg, padding: space.lg, gap: 6 },
  cardPrimary: { backgroundColor: colors.brand },
  cardAccent: { backgroundColor: colors.brandLight },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  cardBody: { fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 20 },
  note: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: space.md },
});
