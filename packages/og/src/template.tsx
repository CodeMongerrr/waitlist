import type { BrandConfig } from "@waitlist-stack/config";
import { OG_TOKENS } from "./tokens";

export interface OgCardInput {
  brand: BrandConfig;
  /** When set, renders the personalized card with name + position. */
  firstName?: string;
  /** Queue position. Required for personalized; ignored otherwise. */
  position?: number;
  /** Optional sub-line under the headline. Falls back to brand.tagline. */
  subCopy?: string;
}

// Two cards in one file: personalized (renders for a resolved ?ref code) and
// generic (the brand fallback). Both return JSX trees compatible with Satori
// (workers-og, next/og, plain satori). They use only flexbox layout because
// Satori does not implement CSS grid or float.

export function PersonalizedCard({
  brand,
  firstName,
  position,
  subCopy,
}: Required<Omit<OgCardInput, "subCopy">> & { subCopy?: string }) {
  const positionLabel = `#${position.toLocaleString()}`;
  // Heuristic font sizing keeps "#10000" on one line.
  const posFontSize =
    position >= 10000 ? 168 : position >= 1000 ? 200 : 240;

  return (
    <div style={shellStyle}>
      <Header brandName={brand.name} />
      <div style={heroStyle}>
        <div style={labelStyle}>queue position</div>
        <div
          style={{
            fontFamily: OG_TOKENS.serifStack,
            fontStyle: "italic",
            fontSize: posFontSize,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            color: OG_TOKENS.ink,
            display: "flex",
          }}
        >
          {positionLabel}
          <span style={{ color: OG_TOKENS.red }}>.</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 24 }}>
        <div style={headlineStyle}>
          {firstName} just got on the {brand.name} waitlist.
        </div>
        <div style={subStyle}>{subCopy ?? brand.tagline}</div>
      </div>
      <Footer brandSiteUrl={brand.siteUrl} />
      <RedBar />
    </div>
  );
}

export function GenericCard({ brand, subCopy }: { brand: BrandConfig; subCopy?: string }) {
  return (
    <div style={shellStyle}>
      <Header brandName={brand.name} />
      <div style={heroStyle}>
        <div
          style={{
            fontFamily: OG_TOKENS.serifStack,
            fontSize: 168,
            lineHeight: 0.92,
            letterSpacing: "-0.03em",
            color: OG_TOKENS.ink,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          <span>{brand.name}</span>
          <span style={{ color: OG_TOKENS.red }}>.</span>
        </div>
        <div style={subStyle}>{subCopy ?? brand.tagline}</div>
      </div>
      <Footer brandSiteUrl={brand.siteUrl} />
      <RedBar />
    </div>
  );
}

function Header({ brandName }: { brandName: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <div
        style={{
          fontFamily: OG_TOKENS.serifStack,
          fontSize: 44,
          letterSpacing: "-0.02em",
          color: OG_TOKENS.ink,
          display: "flex",
        }}
      >
        {brandName}
        <span style={{ color: OG_TOKENS.red }}>.</span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 14,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: OG_TOKENS.muted,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            background: OG_TOKENS.red,
            borderRadius: 99,
            display: "block",
          }}
        />
        private beta
      </div>
    </div>
  );
}

function Footer({ brandSiteUrl }: { brandSiteUrl: string }) {
  const host = brandSiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <div
      style={{
        marginTop: 32,
        paddingTop: 18,
        borderTop: `1px solid ${OG_TOKENS.line}`,
        display: "flex",
        justifyContent: "space-between",
        fontSize: 16,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: OG_TOKENS.muted,
      }}
    >
      <div style={{ display: "flex" }}>{host}</div>
      <div style={{ display: "flex" }}>private beta</div>
    </div>
  );
}

function RedBar() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 6,
        height: OG_TOKENS.height,
        background: OG_TOKENS.red,
        display: "flex",
      }}
    />
  );
}

const shellStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
  background: OG_TOKENS.cream,
  color: OG_TOKENS.ink,
  padding: "72px 80px",
  fontFamily: OG_TOKENS.monoStack,
  position: "relative" as const,
};

const heroStyle = {
  display: "flex",
  flexDirection: "column" as const,
  marginTop: 56,
  flex: 1,
  justifyContent: "center" as const,
};

const labelStyle = {
  fontSize: 22,
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
  color: OG_TOKENS.muted,
  marginBottom: 18,
  display: "flex",
};

const headlineStyle = {
  fontFamily: OG_TOKENS.serifStack,
  fontSize: 38,
  lineHeight: 1.15,
  letterSpacing: "-0.01em",
  color: OG_TOKENS.ink,
  display: "flex",
  maxWidth: 940,
};

const subStyle = {
  fontSize: 22,
  lineHeight: 1.45,
  color: OG_TOKENS.muted,
  marginTop: 14,
  maxWidth: 940,
  display: "flex",
  fontFamily: OG_TOKENS.monoStack,
};
