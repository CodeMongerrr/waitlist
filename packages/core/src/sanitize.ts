// Strip control characters from user-supplied free text before it is stored.
// Removes C0 controls, DEL, C1 controls, and the Unicode line/paragraph
// separators. None of these belong in a real name, handle, or source label,
// but an attacker can smuggle them in to corrupt downstream consumers: a bare
// CR in a CSV export splits the cell and re-opens formula injection past the
// escape guard, and U+2028/U+2029 act as line breaks in some renderers.
// Visible scripts, accents, emoji (including zero-width joiners), and ordinary
// spaces are left untouched.
//
// Iterated by code point (for...of) so surrogate pairs stay intact.

function isControlCodePoint(c: number): boolean {
  return (
    c <= 0x1f || // C0 controls (incl. tab, LF, CR)
    (c >= 0x7f && c <= 0x9f) || // DEL + C1 controls
    c === 0x2028 || // line separator
    c === 0x2029 // paragraph separator
  );
}

export function sanitizeText(value: string): string {
  let out = "";
  for (const ch of value) {
    if (!isControlCodePoint(ch.codePointAt(0) ?? 0)) out += ch;
  }
  return out;
}
