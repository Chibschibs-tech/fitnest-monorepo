export const metadata = { title: "Fitnest", description: "Fitnest Web" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
