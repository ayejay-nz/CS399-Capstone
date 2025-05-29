"use client";
import Tiptap from "@/src/components/ui/tiptap";
import { Button } from "@/src/components/ui/button";
import { useState, useEffect } from "react";

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
  optionIds: string[];
  setOptionIds: (fn: (prev: string[]) => string[]) => void;
  optionContents: string[];
  setOptionContents: (fn: (prev: string[]) => string[]) => void;
  version: number;
  setOptionCount: (fn: (prev: number) => number) => void;
  optionCount: number;
  questions: any[];
  isCoverPage?: boolean;
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
  optionIds,
  setOptionIds,
  optionContents,
  setOptionContents,
  version,
  questions,
  isCoverPage = false,
}: Props) {
  const [validationErrors, setValidationErrors] = useState({
    question: false,
    options: Array(optionCount).fill(false),
  });

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);
  const isAppendix = currentQuestion?.isAppendix;

  const generateOptionId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (optionIds.length !== optionEditors.length) {
      const newIds = optionEditors.map((_, i) =>
        i < optionIds.length ? optionIds[i] : generateOptionId(),
      );
      setOptionIds(newIds);
    }
  }, [optionEditors.length, optionIds.length, setOptionIds]);

  useEffect(() => {
    setValidationErrors({
      question: false,
      options: Array(optionEditors.length).fill(false),
    });
  }, [currentQuestionId]);

  const handleDeleteOption = (index: number) => {
    setOptionEditors((prev) => prev.filter((_, i) => i !== index));
    setOptionIds((prev) => prev.filter((_, i) => i !== index));
    setOptionContents((prev) => prev.filter((_, i) => i !== index));
    setOptionCount((prev) => prev - 1);
    setValidationErrors((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleCheckboxChange = (clickedIndex: number) => {
    if (clickedIndex === 0) return;
    setOptionIds((prev) => {
      const newIds = [...prev];
      [newIds[0], newIds[clickedIndex]] = [newIds[clickedIndex], newIds[0]];
      return newIds;
    });

    setOptionEditors((prev) => {
      const newEditors = [...prev];
      [newEditors[0], newEditors[clickedIndex]] = [
        newEditors[clickedIndex],
        newEditors[0],
      ];
      return newEditors;
    });
    setOptionContents((prev) => {
      const newContents = [...prev];
      [newContents[0], newContents[clickedIndex]] = [
        newContents[clickedIndex],
        newContents[0],
      ];
      return newContents;
    });

    setValidationErrors((prev) => ({
      ...prev,
      options: prev.options.map((val, i) => {
        if (i === 0) return prev.options[clickedIndex];
        if (i === clickedIndex) return prev.options[0];
        return val;
      }),
    }));
  };

  const validateContent = () => {
    let isValid = true;
    const newErrors = {
      question: false,
      options: Array(optionEditors.length).fill(false),
    };

    const hasText = questionEditor?.getText()?.trim();
    const hasImage = questionEditor?.getHTML()?.includes("<img");

    if (!hasText && !hasImage) {
      newErrors.question = true;
      isValid = false;
    }

    if (!isCoverPage && !isAppendix) {
      optionEditors.forEach((editor, i) => {
        const optionHasText = editor?.getText()?.trim();
        const optionHasImage = editor?.getHTML()?.includes("<img");

        if (!optionHasText && !optionHasImage) {
          newErrors.options[i] = true;
          isValid = false;
        }
      });
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateContent()) {
      handleAddOrUpdate();
    }
  };

  const handleCancel = () => {
    setValidationErrors({ question: false, options: [] });
    cancelEdit();
  };

  return (
    <div className="flex-1 p-6 pr-6 rounded-md border border-[#27272a]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="ml-6 text-2xl font-bold">
          {isCoverPage ? "Cover Page" : isAppendix ? "Appendix" : "Question"}
        </h1>
        <div className="flex items-center gap-5">
          {!isCoverPage && !isAppendix && (
            <div className="flex items-center text-sm text-white">
              <div className="flex items-stretch border border-[#27272A] rounded overflow-hidden">
                <span className="px-3 py-0.5 flex items-center border-r border-[#27272A]">
                  Mark(s)
                </span>
                <span className="px-3 py-0.5 flex items-center border-r border-[#27272A]">
                  {marks}
                </span>
                <div className="flex flex-col divide-y divide-[#27272A]">
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
          )}
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleSubmit}>
              {currentQuestionId
                ? "Update"
                : isAppendix
                  ? "Add appendix"
                  : "Add question"}
            </Button>
            {currentQuestionId && (
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="ml-6 mr-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 w-full mr-30">
            <Tiptap
              key={`${isCoverPage ? "cover" : "question"}-${currentQuestionId}-${version}`}
              setEditor={setQuestionEditor}
              allowImageUpload
              isQuestionEditor={true}
              isAppendix={isAppendix}
              error={validationErrors.question}
              onUpdate={(_, text) => {
                setValidationErrors((prev) => ({
                  ...prev,
                  question: !text,
                }));
              }}
            />
          </div>
        </div>

        {!isCoverPage && !isAppendix && (
          <div className="mt-6 w-full">
            <h2 className="text-lg font-semibold mb-4">Options</h2>
            <div className="flex flex-col gap-4">
              {optionEditors.map((editor, i) => {
                const optionId = optionIds[i] || generateOptionId();
                return (
                  <div
                    key={`${optionId}-stable-${version}`}
                    className="flex items-center gap-2 mr-30"
                  >
                    <input
                      type="checkbox"
                      checked={i === 0}
                      onChange={() => handleCheckboxChange(i)}
                      className="h-5 w-5 mr-3 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 w-full relative">
                      <Tiptap
                        key={`${optionId}-editor-${version}`}
                        setEditor={(editor) => {
                          setOptionEditors((prev) => {
                            const updated = [...prev];
                            updated[i] = editor;
                            return updated;
                          });
                        }}
                        content={optionContents[i]}
                        onUpdate={(html, text) => {
                          setOptionContents((prev) => {
                            const newContents = [...prev];
                            newContents[i] = html;
                            return newContents;
                          });
                          setValidationErrors((prev) => {
                            const newOptions = [...prev.options];
                            newOptions[i] = !text;
                            return { ...prev, options: newOptions };
                          });
                        }}
                        error={validationErrors.options[i]}
                      />
                      <button
                        onClick={() => handleDeleteOption(i)}
                        className="absolute right-2 top-3 p-1 hover:bg-white/10 rounded-sm"
                        disabled={optionCount <= 2}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 14 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <path
                            d="M1 3.99967H2.33333M2.33333 3.99967H13M2.33333 3.99967V13.333C2.33333 13.6866 2.47381 14.0258 2.72386 14.2758C2.97391 14.5259 3.31304 14.6663 3.66667 14.6663H10.3333C10.687 14.6663 11.0261 14.5259 11.2761 14.2758C11.5262 14.0258 11.6667 13.6866 11.6667 13.333V3.99967M4.33333 3.99967V2.66634C4.33333 2.31272 4.47381 1.97358 4.72386 1.72353C4.97391 1.47348 5.31304 1.33301 5.66667 1.33301H8.33333C8.68696 1.33301 9.02609 1.47348 9.27614 1.72353C9.52619 1.97358 9.66667 2.31272 9.66667 2.66634V3.99967M5.66667 7.33301V11.333M8.33333 7.33301V11.333"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              <div>
                <Button
                  variant="secondary"
                  className="ml-10"
                  onClick={() => {
                    const newId = generateOptionId();
                    setOptionCount((prev) => prev + 1);
                    setOptionEditors((prev) => [...prev, null]);
                    setOptionIds((prev) => [...prev, newId]);
                    setOptionContents((prev) => [...prev, ""]);
                    setValidationErrors((prev) => ({
                      ...prev,
                      options: [...prev.options, false],
                    }));
                  }}
                  disabled={optionCount >= 5}
                >
                  + Add Option
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
