export default function ExportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal layout for Playwright PDF export — no nav, no overlays, no animated bg.
  // Body styles are reset in each export page's inline <style> tag.
  return <>{children}</>;
}
