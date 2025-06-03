"use client";

import * as React from "react";

type Label = "A" | "B" | "C" | "D" | "E";

export function AnswerOptionsEditor({
  answerOptions,
  correctOptions,
  onSave,
}: {
  answerOptions: Record<Label, string>;
  correctOptions: Label[];
  onSave: (newCorrect: Label[]) => void;
}) {
  const allLabels: Label[] = ["A", "B", "C", "D", "E"];
  const [isEditing, setIsEditing] = React.useState(false);
  const [temp, setTemp] = React.useState<Label[]>([]);

  const start = () => {
    setTemp(correctOptions);
    setIsEditing(true);
  };
  const cancel = () => {
    setIsEditing(false);
  };

  // Only include labels that actually exist in answerOptions
  const availableLabels = allLabels.filter((lbl) => lbl in answerOptions);
  const allAreTrue = temp.length === availableLabels.length;

  const setAllTrue = () => {
    setTemp(availableLabels as Label[]);
  };

  const reset = () => {
    setTemp(correctOptions);
  };

  // Determine if temp differs from correctOptions
  const hasChanges =
    temp.length !== correctOptions.length ||
    temp.some((lbl, idx) => lbl !== correctOptions[idx]);

  const save = () => {
    onSave(temp);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="space-y-1">
        {availableLabels.map((opt) => {
          const selected = isEditing
            ? temp.includes(opt)
            : correctOptions.includes(opt);
          return (
            <p
              key={opt}
              className={`${selected ? "font-semibold text-green-400" : ""}`}
            >
              <span className="font-medium">{opt}.</span> {answerOptions[opt]}
            </p>
          );
        })}
      </div>

      <div className="mt-4 space-x-2 flex items-center">
        {isEditing ? (
          <>
            {allAreTrue ? (
              <button
                onClick={reset}
                className="px-4 py-1 bg-yellow-500 text-white rounded"
              >
                Reset
              </button>
            ) : (
              <button
                onClick={setAllTrue}
                className="px-4 py-1 bg-green-500 text-white rounded"
              >
                Set All True
              </button>
            )}

            {/* Only show Update if temp !== correctOptions */}
            {hasChanges && (
              <button
                onClick={save}
                className="px-4 py-1 bg-blue-500 text-white rounded"
              >
                Update
              </button>
            )}

            <button onClick={cancel} className="px-4 py-1 border rounded">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={start} className="px-4 py-1 border rounded">
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
