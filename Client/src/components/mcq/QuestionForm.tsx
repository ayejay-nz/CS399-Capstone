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
  marks: number;
  adjustMarks: (amount: number) => void;
  optionCount: number;
}

export default function QuestionForm({
  questionEditor,
  setQuestionEditor,
  optionEditors,
  setOptionEditors,
  currentQuestionId,
  handleAddOrUpdate,
  cancelEdit,
  marks,
  adjustMarks,
  optionCount,
}: Props) {
  return (
    <div
      className="flex-1 rounded-lg p-6 pr-10"
      style={{ backgroundColor: "oklch(23% 0 0)" }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="ml-6 text-2xl font-bold">Questions</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-sm text-white">
            <div className="flex items-stretch border border-gray-600 rounded overflow-hidden">
              <span className="px-3 py-0.5 flex items-center border-r border-gray-600 ">
                Mark(s)
              </span>
              <span className="px-3 py-0.5 flex items-center border-r border-gray-600 ">
                {marks}
              </span>
              <div className="flex flex-col divide-y divide-gray-600">
                <button
                  className="px-2 h-full hover:bg-gray-700 leading-none"
                  onClick={() => adjustMarks(1)}
                >
                  ↑
                </button>
                <button
                  className="px-2 h-full hover:bg-gray-700 leading-none disabled:opacity-50"
                  onClick={() => adjustMarks(-1)}
                  disabled={marks <= 1}
                >
                  ↓
                </button>
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={handleAddOrUpdate}>
            {currentQuestionId ? "update" : "add question"}
          </Button>
          {currentQuestionId && (
            <Button variant="secondary" onClick={cancelEdit}>
              cancel
            </Button>
          )}
        </div>
      </div>

      <div className="ml-6 mr-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 w-full mr-30">
            <Tiptap
              setEditor={setQuestionEditor}
              allowImageUpload
              isQuestionEditor={true}
            />
          </div>
        </div>

        <div className="mt-8 w-full">
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <div className="flex flex-col gap-4">
            {Array.from({ length: optionCount }).map((_, i) => (
              <div
                key={`${currentQuestionId || "new"}-${i}`}
                className="flex items-center gap-2 mr-30"
              >
                <span className="font-medium w-8">
                  {String.fromCharCode(65 + i)})
                </span>
                <div className="flex-1 w-full">
                  <Tiptap
                    key={`${currentQuestionId || "new"}-${i}`}
                    setEditor={(editor) => {
                      setOptionEditors((prev) => {
                        const updated = [...prev];
                        updated[i] = editor;
                        return updated;
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
