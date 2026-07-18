import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  priceComposedMeal,
  type ComposeComponent,
  type ComposeSettings,
  type Pick as CorePick,
} from "@fitnest/core";
import { fetchComposeCatalog } from "../lib/api";
import { colors, radius, space } from "../lib/theme";

const SLOT_LABELS: Record<string, string> = {
  protein: "Proteines",
  carb: "Feculents",
  veg: "Legumes",
  sauce: "Sauces",
  extra: "Extras",
};
const SLOT_ORDER = ["protein", "carb", "veg", "sauce", "extra"];

export default function Compose() {
  const [components, setComponents] = useState<ComposeComponent[]>([]);
  const [settings, setSettings] = useState<ComposeSettings | null>(null);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComposeCatalog()
      .then((c) => {
        setComponents(c.components ?? []);
        setSettings(c.settings?.[0] ?? null);
      })
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, []);

  const picks: CorePick[] = useMemo(
    () =>
      Object.entries(qty)
        .filter(([, q]) => q > 0)
        .map(([id, q]) => ({ componentId: Number(id), qty: q })),
    [qty],
  );

  const result = useMemo(
    () => (settings ? priceComposedMeal(picks, components, settings) : null),
    [picks, components, settings],
  );

  const bump = (id: number, d: number) =>
    setQty((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + d) }));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  if (error || !settings) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Impossible de charger le catalogue.</Text>
        <Text style={styles.errSub}>{error ?? "Aucun reglage actif."}</Text>
      </View>
    );
  }

  const bySlot = (slot: string) => components.filter((c) => c.slot === slot);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {SLOT_ORDER.filter((s) => bySlot(s).length > 0).map((slot) => (
          <View key={slot} style={styles.section}>
            <Text style={styles.sectionTitle}>{SLOT_LABELS[slot] ?? slot}</Text>
            {bySlot(slot).map((c) => (
              <View key={c.id} style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowName}>{c.name}</Text>
                  <Text style={styles.rowMeta}>
                    {c.portion_grams} g · {Math.round(Number(c.protein_g))} g prot
                    {Number(c.surcharge_mad) > 0
                      ? ` · +${Number(c.surcharge_mad)} MAD`
                      : ""}
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable style={styles.stepBtn} onPress={() => bump(c.id, -1)}>
                    <Text style={styles.stepTxt}>–</Text>
                  </Pressable>
                  <Text style={styles.qty}>{qty[c.id] ?? 0}</Text>
                  <Pressable style={styles.stepBtn} onPress={() => bump(c.id, 1)}>
                    <Text style={styles.stepTxt}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ))}
        <View style={{ height: 140 }} />
      </ScrollView>

      {result && (
        <View style={styles.bar}>
          <View style={styles.macros}>
            <Text style={styles.kcal}>{Math.round(result.kcal)} kcal</Text>
            <Text style={styles.macroLine}>
              P {Math.round(result.protein_g)} · G {Math.round(result.carbs_g)} · L{" "}
              {Math.round(result.fat_g)}
            </Text>
            {!result.valid && result.errors[0] ? (
              <Text style={styles.barErr}>{result.errors[0]}</Text>
            ) : (
              <Text style={styles.extras}>
                Extras {result.extrasUsed}/{result.maxExtras}
              </Text>
            )}
          </View>
          <View style={styles.priceBox}>
            <Text style={styles.price}>{result.total.toFixed(0)} MAD</Text>
            <Text style={styles.priceSub}>par plat</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: space.lg },
  err: { fontSize: 16, fontWeight: "700", color: colors.danger },
  errSub: { fontSize: 13, color: colors.muted, marginTop: 6, textAlign: "center" },
  container: { padding: space.lg, gap: space.lg },
  section: { gap: space.sm },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
  },
  rowInfo: { flex: 1, paddingRight: space.sm },
  rowName: { fontSize: 15, fontWeight: "600", color: colors.text },
  rowMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: space.sm },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTxt: { color: "#fff", fontSize: 20, fontWeight: "700", lineHeight: 22 },
  qty: { minWidth: 20, textAlign: "center", fontSize: 16, fontWeight: "700", color: colors.text },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.brand,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  macros: { gap: 2 },
  kcal: { color: "#fff", fontSize: 18, fontWeight: "800" },
  macroLine: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  extras: { color: colors.accent, fontSize: 12, fontWeight: "600" },
  barErr: { color: colors.accent, fontSize: 12, fontWeight: "600" },
  priceBox: { alignItems: "flex-end" },
  price: { color: "#fff", fontSize: 24, fontWeight: "800" },
  priceSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
});
