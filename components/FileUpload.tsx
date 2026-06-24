"use client";

import { useRef } from "react";
import { Upload, RefreshCw } from "lucide-react";

export default function FileUpload({
  onFile,
  hasData,
}: {
  onFile: (f: File) => void;
  hasData: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => ref.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        {hasData ? <RefreshCw size={16} /> : <Upload size={16} />}
        {hasData ? "Subir otro archivo" : "Subir archivo maestro"}
      </button>
    </div>
  );
}
