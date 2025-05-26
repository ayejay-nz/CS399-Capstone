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
  const allLabels: Label[] = ["A","B","C","D","E"];
  const [isEditing, setIsEditing] = React.useState(false);
  const [temp, setTemp] = React.useState<Label[]>([]);

  const start = () => {
    setTemp(correctOptions);
    setIsEditing(true);
  };
  const toggle = (opt: Label) =>
    setTemp((arr) =>
      arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]
    );
  const cancel = () => setIsEditing(false);
  const save   = () => { onSave(temp); setIsEditing(false); };

  return (
    <div>
      <div className="space-y-1">
        {allLabels
          .filter((opt) => opt in answerOptions)
          .map((opt) => {
            const selected = isEditing
              ? temp.includes(opt)
              : correctOptions.includes(opt);
            return (
              <p
                key={opt}
                onClick={isEditing ? () => toggle(opt) : undefined}
                className={`${selected ? "font-semibold text-green-400" : ""} ${
                  isEditing ? "cursor-pointer" : ""
                }`}
              >
                <span className="font-medium">{opt}.</span>{" "}
                {answerOptions[opt]}
              </p>
            );
          })}
      </div>
      <div className="mt-4 space-x-2">
        {isEditing ? (
          <>
            <button onClick={save} className="px-4 py-1 bg-blue-500 text-white rounded">
              Update
            </button>
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
