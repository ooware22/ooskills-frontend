import { ImageResponse } from "next/og";

// Social-sharing image, generated at the size the tags declare (1200x630).
// It replaces the wide logo (1660x408, 464 KB) that used to be declared as
// 1200x630 and was cropped by social networks.

export const alt = "OOSkills – Formations en ligne en Algérie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #002147, #003366)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 112, fontWeight: 700, letterSpacing: -2 }}>
          <span style={{ color: "#CFB53B" }}>OO</span>
          <span>Skills</span>
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 44, color: "#E8D48A" }}>
          Formations en ligne en Algérie
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 30, color: "rgba(255,255,255,0.8)" }}>
          Cours, quiz et certificats de réussite vérifiables
        </div>
      </div>
    ),
    size,
  );
}
