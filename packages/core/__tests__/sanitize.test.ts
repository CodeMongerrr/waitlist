import { describe, expect, it } from "vitest";
import { sanitizeText } from "../src/sanitize.js";

// Control chars are built via fromCharCode rather than written as literals so
// the test source stays plain ASCII and reviewable.
const NUL = String.fromCharCode(0x00);
const TAB = String.fromCharCode(0x09);
const LF = String.fromCharCode(0x0a);
const CR = String.fromCharCode(0x0d);
const DEL = String.fromCharCode(0x7f);
const NEL = String.fromCharCode(0x85); // C1 control
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);
const ZWJ = String.fromCodePoint(0x200d);

describe("sanitizeText", () => {
  it("strips C0 controls (tab, LF, CR, NUL)", () => {
    expect(sanitizeText(`a${CR}${LF}b`)).toBe("ab");
    expect(sanitizeText(`a${TAB}b`)).toBe("ab");
    expect(sanitizeText(`a${NUL}b`)).toBe("ab");
  });

  it("strips DEL, C1 controls, and Unicode line/paragraph separators", () => {
    expect(sanitizeText(`a${DEL}b`)).toBe("ab");
    expect(sanitizeText(`a${NEL}b`)).toBe("ab");
    expect(sanitizeText(`a${LINE_SEP}b${PARA_SEP}c`)).toBe("abc");
  });

  it("preserves accents, spaces, and emoji with zero-width joiners", () => {
    expect(sanitizeText("José Núñez")).toBe("José Núñez");
    expect(sanitizeText("a b  c")).toBe("a b  c");
    // Family emoji is code points joined by ZWJ (U+200D), not a control char;
    // it must survive intact with no mangled surrogate halves.
    const family = `${String.fromCodePoint(0x1f468)}${ZWJ}${String.fromCodePoint(
      0x1f469,
    )}${ZWJ}${String.fromCodePoint(0x1f467)}`;
    expect(sanitizeText(family)).toBe(family);
  });

  it("neutralizes a CR-smuggled CSV formula payload at the source", () => {
    expect(sanitizeText(`x${CR}=cmd|'/c calc'!A1`)).toBe("x=cmd|'/c calc'!A1");
  });
});
