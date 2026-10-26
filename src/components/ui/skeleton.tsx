import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("skeleton block", className)} />;
}

export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="motion-fade flex flex-col gap-7">
      <span className="sr-only">{label}…</span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-11 w-2/3 max-w-[460px]" />
        <Skeleton className="h-4 w-full max-w-[560px]" />
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-[118px] rounded-tile" />
        ))}
      </div>
      <Skeleton className="h-[220px] rounded-tile" />
    </div>
  );
}

export function LoadingRows({ columns, rows = 4 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} aria-hidden>
          {Array.from({ length: columns }, (_, column) => (
            <td key={column} className={cn("px-5 py-[19px]", row > 0 && "border-t border-line")}>
              <Skeleton className={cn("h-4", column === 0 ? "w-3/4" : "w-1/2")} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonLines({ lines = 3 }: { lines?: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-2.5 py-2">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn("h-4", index === lines - 1 ? "w-2/5" : "w-full")} />
      ))}
    </div>
  );
}
