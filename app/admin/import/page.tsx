import { Suspense } from "react";
import { BulkImportForm } from "@/components/fresherdesk/bulk-import-form";

export default function AdminImportPage() {
  return (
    <Suspense fallback={<p className="text-xs text-slate-500">Loading import tool...</p>}>
      <BulkImportForm />
    </Suspense>
  );
}
