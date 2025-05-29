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
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="*/*"
        className="hidden"
      />
      <Button variant="secondary" size="sm" onClick={triggerFileInput}>
        Upload Existing Exam
      </Button>
    </div>
  );
}
