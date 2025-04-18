"use client";
import { Button } from "@/src/components/ui/button";

interface Question {
  id: number;
  content: string;
  options: string[];
}

interface Props {
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

export default function QuestionList({
  questions,
  onEdit,
  onDelete,
  onClearAll,
}: Props) {
  return (
    <div
      className="lg:w-[400px] rounded-lg p-6 flex flex-col"
      style={{ backgroundColor: "oklch(23% 0 0)", height: "605px" }}
    >
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Questions</h2>
          <button
            className="text-base text-gray-300 hover:text-white underline underline-offset-2 transition-colors"
            onClick={onClearAll}
          >
            clear all
          </button>
        </div>

        {questions.map((q, index) => (
          <div
            key={q.id}
            className="cursor-pointer p-2 border rounded-lg flex justify-between items-center"
            onClick={() => onEdit(q)}
          >
            <div className="flex items-start gap-2">
              <span className="font-semibold">{index + 1}.</span>
              <div
                className="line-clamp-1"
                dangerouslySetInnerHTML={{ __html: q.content }}
              />
            </div>
            <button
              className="p-1 text-gray-400 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(q.id);
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <div className="flex flex-col items-center space-y-4">
          <hr className="w-full border-gray-600" />
          <Button variant="secondary">preview</Button>
        </div>
      </div>
    </div>
  );
}
