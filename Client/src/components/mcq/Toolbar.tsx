"use client";
import { Button } from "@/src/components/ui/button";

interface Props {
  mode: "form" | "text";
  setMode: (m: "form" | "text") => void;
  onUpload: () => void;
}

export default function Toolbar({ mode, setMode, onUpload }: Props) {
  return (
    <div className="flex justify-between gap-4 mb-8 mt-5">
      <div className="flex bg-white rounded-md p-1">
        <Button
          variant={mode === "form" ? "switch" : "secondary"}
          onClick={() => setMode("form")}
        >
          form editor
        </Button>
        <Button
          variant={mode === "text" ? "switch" : "secondary"}
          onClick={() => setMode("text")}
        >
          text editor
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onUpload}>
          upload file
        </Button>
      </div>
    </div>
  );
}
