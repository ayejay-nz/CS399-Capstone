"use client";

import { Button } from "@/src/components/ui/button";

interface Props {
  onBack: () => void;
  onReset: () => void;
  onUpload: () => void;
}

export default function CustomCover({ onBack, onReset, onUpload }: Props) {
  return (
    <div className="flex-1 p-6 pr-6 rounded-md flex flex-col border border-[#27272a]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="ml-6 text-2xl font-bold">Imported Cover Page</h1>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button variant="secondary" onClick={onReset}>
            Reset
          </Button>
          <Button variant="secondary" onClick={onUpload}>
            Upload Cover Page
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-gray-400">Edit on Word</p>
      </div>
    </div>
  );
}
