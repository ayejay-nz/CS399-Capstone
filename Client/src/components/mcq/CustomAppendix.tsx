"use client";

import { Button } from "@/src/components/ui/button";

interface Props {
  onReset: () => void;
  onUpload: () => void;
}

export default function CustomAppendix({ onReset, onUpload }: Props) {
  return (
    <div
      className="flex-1 p-6 pr-6 rounded-md flex flex-col"
      style={{ backgroundColor: "oklch(23% 0 0)" }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Imported Appendix</h1>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
          <Button variant="secondary" onClick={onUpload}>
            Upload Appendix
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-gray-400">Edit on Word</p>
      </div>
    </div>
  );
}
