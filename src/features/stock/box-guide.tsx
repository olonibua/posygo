"use client";

import { useState } from "react";

import { ChoiceChip } from "@/components/ui/choice-chip";
import { Paper, Stamp } from "@/components/ui/surfaces";

import { BOX_GUIDE, BOX_MATERIAL, type BoxGuideEntry, centimetres, packBottles, packGarments } from "./box-guide-data";
import { BoxMeasure } from "./box-measure";
import { STORAGE_TIER_LABELS } from "./display";
import { type BoxContents, IsoBox } from "./iso-box";

function fitLine(entry: BoxGuideEntry, contents: BoxContents): string {
  if (contents === "bottles") {
    const { placements, limitedByWeight } = packBottles(entry);
    return `About ${placements.length} bottles of 100 ml${limitedByWeight ? ", stopped by the weight limit" : ""}`;
  }
  return `About ${packGarments(entry).placements.length} folded T-shirts`;
}

export function BoxGuide() {
  const [contents, setContents] = useState<BoxContents>("bottles");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[560px] text-small text-ink-soft">
          You pay for the space a box takes on the shelf. Any box counts as the smallest size it fits in, so use whatever boxes you can get. Drawings are to scale.
        </p>
        <div role="group" aria-label="Show" className="flex gap-2">
          <ChoiceChip tone="sky" selected={contents === "bottles"} onToggle={() => setContents("bottles")}>
            Skincare bottles
          </ChoiceChip>
          <ChoiceChip tone="pink" selected={contents === "clothes"} onToggle={() => setContents("clothes")}>
            Folded clothes
          </ChoiceChip>
        </div>
      </div>
      <BoxMeasure />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {BOX_GUIDE.map((entry) => {
          const name = STORAGE_TIER_LABELS[entry.tier].label;
          return (
            <Paper key={entry.tier} className="flex flex-col gap-3 px-5 py-4">
              <Stamp>{name}</Stamp>
              <IsoBox entry={entry} contents={contents} label={`${name} box, up to ${centimetres(entry.maxMm)}, holding ${fitLine(entry, contents).toLowerCase()}`} />
              <div className="text-small">
                <p className="font-medium">Any box up to {centimetres(entry.maxMm)}</p>
                <p className="text-meta text-ink-faint">Up to {entry.maxKg} kg</p>
                <p className="mt-2 text-ink-soft">{fitLine(entry, contents)}</p>
                <p className="mt-1 text-meta text-ink-faint">For example {entry.examples.join(" or ")}</p>
              </div>
            </Paper>
          );
        })}
      </div>
      <p className="text-meta text-ink-faint">{BOX_MATERIAL} works best. A 100 ml bottle is drawn as 4 × 13 cm and a folded T-shirt as 28 × 21 × 3 cm.</p>
    </div>
  );
}
