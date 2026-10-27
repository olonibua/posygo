import { EmptyState } from "@/components/ui/navigation-controls";

export default function StoreNotFound() {
  return (
    <main id="main" className="mx-auto max-w-[760px] px-4 py-20">
      <EmptyState title="This store isn't open" body="Check the address, or come back later." />
    </main>
  );
}
