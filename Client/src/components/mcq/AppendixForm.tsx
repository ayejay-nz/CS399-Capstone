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
    const hasContent = questionEditor?.getText()?.trim();
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
    <div
      className="flex-1 p-6 pr-6 rounded-md"
      style={{ backgroundColor: "oklch(23% 0 0)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="ml-6 text-2xl font-bold">Appendix</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleSubmit}>
            Update
          </Button>
          <Button variant="secondary" onClick={cancelEdit}>
            Cancel
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".doc,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="appendix-upload"
            />
            <label htmlFor="appendix-upload">
              <Button variant="secondary" asChild>
                <span>Upload Appendix</span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      <div className="ml-6 mr-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 w-full mr-30">
            <Tiptap
              key={`appendix-${currentQuestionId}`}
              setEditor={setQuestionEditor}
              allowImageUpload
              isQuestionEditor={true}
              error={validationError}
              content={content}
              onUpdate={(html: string, text: string) => {
                setValidationError(!text);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
