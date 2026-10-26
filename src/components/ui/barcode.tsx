import JsBarcode from "jsbarcode";
import { useMemo } from "react";

interface BarRun {
  start: number;
  width: number;
}

function encode(value: string): { bars: BarRun[]; modules: number } {
  const target: { encodings?: Array<{ data: string }> } = {};
  JsBarcode(target, value, { format: "CODE128" });
  const pattern = (target.encodings ?? []).map((encoding) => encoding.data).join("");
  const bars: BarRun[] = [];
  for (let index = 0; index < pattern.length; index += 1) {
    if (pattern[index] !== "1") {
      continue;
    }
    const last = bars.at(-1);
    if (last && last.start + last.width === index) {
      last.width += 1;
    } else {
      bars.push({ start: index, width: 1 });
    }
  }
  return { bars, modules: pattern.length };
}

export function Barcode({ value, height = 48 }: { value: string; height?: number }) {
  const { bars, modules } = useMemo(() => encode(value), [value]);
  return (
    <svg role="img" aria-label={`Barcode ${value}`} viewBox={`0 0 ${modules} ${height}`} preserveAspectRatio="none" width="100%" height={height}>
      {bars.map((bar) => (
        <rect key={bar.start} x={bar.start} y={0} width={bar.width} height={height} fill="currentColor" />
      ))}
    </svg>
  );
}
