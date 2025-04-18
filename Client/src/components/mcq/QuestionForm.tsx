"use client";
import Tiptap from "@/src/components/ui/tiptap";
import { Button } from "@/src/components/ui/button";

interface Props {
  questionEditor: any;
  setQuestionEditor: (e: any) => void;
  optionEditors: any[];
  setOptionEditors: (fn: (prev: any[]) => any[]) => void;
  currentQuestionId: number | null;
  handleAddOrUpdate: () => void;
  cancelEdit: () => void;
}

export default function QuestionForm({
  questionEditor,
  setQuestionEditor,
  optionEditors,
  setOptionEditors,
  currentQuestionId,
  handleAddOrUpdate,
  cancelEdit,
}: Props) {
  return (
    <div
      className="flex-1 rounded-lg p-6 pr-10"
      style={{ backgroundColor: "oklch(23% 0 0)" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Questions</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleAddOrUpdate}>
            {currentQuestionId ? "update question" : "add question"}
          </Button>
          {currentQuestionId && (
            <Button variant="secondary" onClick={cancelEdit}>
              cancel edit
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Tiptap setEditor={setQuestionEditor} allowImageUpload />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Options</h2>
        <div className="flex flex-col gap-4">
          {["A", "B", "C", "D", "E"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-medium w-8">{label})</span>
              <div className="flex-1">
                <Tiptap
                  setEditor={(editor) =>
                    setOptionEditors((prev) => {
                      const updated = [...prev];
                      updated[i] = editor;
                      return updated;
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
