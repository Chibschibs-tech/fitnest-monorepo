import { StyleSheet, Text, View, ScrollView } from "react-native";
import { colors, radius, space } from "../lib/theme";

// Skeleton programmes screen. The full configurator (day/duration pickers wired
// to /api/calculate-price) lands in Phase 2 once auth is active for cart/orders.
const PROGRAMMES = [
  {
    name: "Weight Loss",
    tagline: "Deficit maitrise, satiete preservee.",
    from: "des 509 MAD / sem",
  },
  {
    name: "Muscle Gain",
    tagline: "Proteines elevees pour la prise de masse.",
    from: "des 655 MAD / sem",
  },
];

export default function Plans() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {PROGRAMMES.map((p) => (
        <View key={p.name} style={styles.card}>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.tagline}>{p.tagline}</Text>
          <Text style={styles.from}>{p.from}</Text>
        </View>
      ))}
      <Text style={styles.note}>
        Les prix definitifs sont calcules cote serveur (memes moteurs que le web).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, gap: space.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: 6,
  },
  name: { fontSize: 20, fontWeight: "700", color: colors.text },
  tagline: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  from: { fontSize: 15, fontWeight: "700", color: colors.brandLight, marginTop: 4 },
  note: { fontSize: 12, color: colors.muted, textAlign: "center", marginTop: space.sm },
});
