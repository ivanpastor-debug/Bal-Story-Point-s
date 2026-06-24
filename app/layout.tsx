import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BALÚ · Tablero de seguimiento HU",
  description: "Seguimiento de Historias de Usuario por etapa del proceso de desarrollo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
