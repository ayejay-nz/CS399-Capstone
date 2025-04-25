"use client";
import Tiptap from "@/src/components/ui/tiptap";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";

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
  setOptionCount: (count: number) => void;
}

export default function QuestionForm({
  questionEditor,
  setQuestionEditor,
  optionEditors,
  setOptionEditors,
  setOptionCount,
  currentQuestionId,
  handleAddOrUpdate,
  cancelEdit,
  marks,
  adjustMarks,
  optionCount,
}: Props) {
  const [validationErrors, setValidationErrors] = useState({
    question: false,
    options: Array(optionCount).fill(false),
  });

  const handleDeleteOption = (index: number) => {
    setOptionEditors((prev) => prev.filter((_, i) => i !== index));
    setOptionCount(optionCount - 1);
    setValidationErrors((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const validateContent = () => {
    let isValid = true;
    const newErrors = {
      question: false,
      options: Array(optionCount).fill(false),
    };

    if (!questionEditor || !questionEditor.getText().trim()) {
      newErrors.question = true;
      isValid = false;
    }

    for (let i = 0; i < optionEditors.length; i++) {
      const editor = optionEditors[i];
      if (!editor || !editor.getText().trim()) {
        newErrors.options[i] = true;
        isValid = false;
      }
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateContent()) {
      handleAddOrUpdate();
    }
  };

  return (
    <div
      className="flex-1 rounded-lg p-6 pr-10"
      style={{ backgroundColor: "oklch(23% 0 0)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="ml-6 text-2xl font-bold">Questions</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-sm text-white">
            <div className="flex items-stretch border border-gray-600 rounded overflow-hidden">
              <span className="px-3 py-0.5 flex items-center border-r border-gray-600">
                Mark(s)
              </span>
              <span className="px-3 py-0.5 flex items-center border-r border-gray-600">
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
          <Button variant="secondary" onClick={handleSubmit}>
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
          <div
            className={`flex-1 w-full mr-30 ${validationErrors.question ? "outline outline-2 outline-red-500 rounded-md [&_.tiptap]:focus:outline-none" : ""}`}
          >
            <Tiptap
              setEditor={setQuestionEditor}
              allowImageUpload
              isQuestionEditor={true}
              className={
                validationErrors.question ? "[&_.tiptap]:border-none" : ""
              }
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
                <div
                  className={`flex-1 w-full ${i === 0 && !validationErrors.options[i] ? "border-2 border-white" : ""} ${validationErrors.options[i] ? "outline outline-2 outline-red-500 rounded-md [&_.tiptap]:border-none [&_.tiptap]:focus:outline-none" : ""}`}
                >
                  <Tiptap
                    key={`${currentQuestionId || "new"}-${i}`}
                    setEditor={(editor) => {
                      setOptionEditors((prev) => {
                        const updated = [...prev];
                        updated[i] = editor;
                        return updated;
                      });
                      if (editor?.getText().trim()) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          options: prev.options.map((err, idx) =>
                            idx === i ? false : err,
                          ),
                        }));
                      }
                    }}
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteOption(i)}
                  className="ml-2"
                  disabled={optionCount <= 1}
                >
                  Delete
                </Button>
              </div>
            ))}
            <div>
              <Button
                variant="secondary"
                className="ml-10"
                onClick={() => {
                  setOptionCount(optionCount + 1);
                  setOptionEditors([...optionEditors, null]);
                  setValidationErrors((prev) => ({
                    ...prev,
                    options: [...prev.options, false],
                  }));
                }}
                disabled={optionCount >= 5}
              >
                Add Option
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
