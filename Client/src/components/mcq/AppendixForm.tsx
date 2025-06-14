"use client";
import Tiptap from "@/src/components/ui/tiptap";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";

interface Props {
  questionEditor: any;
  setQuestionEditor: (e: any) => void;
  currentQuestionId: number | null;
  handleAddOrUpdate: () => void;
  cancelEdit: () => void;
  content?: string;
  onUploadFile?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AppendixForm({
  questionEditor,
  setQuestionEditor,
  currentQuestionId,
  handleAddOrUpdate,
  cancelEdit,
  content = "",
  onUploadFile,
}: Props) {
  const [validationError, setValidationError] = useState(false);

  const validateContent = () => {
    const hasText = questionEditor?.getText()?.trim();
    const hasImages = questionEditor?.getHTML()?.includes("<img");
    const hasContent = hasText || hasImages;
    setValidationError(!hasContent);
    return hasContent;
  };

  const handleSubmit = () => {
    if (validateContent()) {
      handleAddOrUpdate();
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (onUploadFile) {
      onUploadFile(event);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-6 pr-6 rounded-md border border-[#27272a] bg-[#0B0B0B]">
      <h1 className="ml-6 text-2xl font-bold mb-4">Appendix</h1>
      <div className="ml-6 mr-4 flex-1 flex flex-col">
        <div className="flex-1 w-full">
          <Tiptap
            key={`appendix-${currentQuestionId}`}
            setEditor={setQuestionEditor}
            allowImageUpload
            isQuestionEditor={true}
            error={validationError}
            content={content}
            onUpdate={(_html: string, text: string) => {
              const hasImages = _html.includes("<img");
              setValidationError(!text && !hasImages);
            }}
          />
        </div>
      </div>
      <div className="ml-6 mr-4 flex justify-end items-center gap-2 mt-16">
        <Button variant="secondary" onClick={handleSubmit}>
          Update
        </Button>
        <Button variant="secondary" onClick={cancelEdit}>
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".docx,.txt,.xml,.tex";
            input.onchange = (e) => {
              if (onUploadFile) {
                onUploadFile((e as unknown) as React.ChangeEvent<HTMLInputElement>);
              }
            };
            input.click();
          }}
        >
          Upload Appendix
        </Button>
      </div>
    </div>
  );
}
