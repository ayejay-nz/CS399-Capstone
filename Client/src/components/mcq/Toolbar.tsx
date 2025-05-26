"use client";
import { Button } from "@/src/components/ui/button";
import { useRef } from "react";
interface Props {
  mode: "form" | "text";
  setMode: (m: "form" | "text") => void;
  onUpload: (file: File) => void;
}

export default function Toolbar({ mode, setMode, onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = "";
    }
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex justify-between gap-4 mb-8 mt-5">
      <div className="flex bg-white rounded-md p-1">
        <Button
          variant={mode === "form" ? "switch" : "secondary"}
          onClick={() => setMode("form")}
        >
          Form editor
        </Button>
        <Button
          variant={mode === "text" ? "switch" : "secondary"}
          onClick={() => setMode("text")}
        >
          text editor
        </Button>
      </div>
      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="*/*"
          className="hidden"
        />
        <Button variant="secondary" onClick={triggerFileInput}>
          Upload file
        </Button>
      </div>
    </div>
  );
}
