import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fitnest — Menu",
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
