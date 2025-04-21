"use client";
import { Button } from "@/src/components/ui/button";

interface Question {
  id: number;
  content: string;
  options: string[];
  marks: number;
  displayText?: string;
}

interface Props {
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
}

function convertHtmlToPlainText(html: string) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

async function handlePreview(questions: Question[]) {
  const payload = {
    content: questions.map((q, idx) => {
      const questionText = convertHtmlToPlainText(q.content);
      const imgSrcMatch = q.content.match(/<img[^>]+src="([^">]+)"/);
      const imageUri = imgSrcMatch?.[1] || "";

      return {
        question: {
          marks: q.marks || 1,
          id: idx + 1,
          feedback: {
            correctFeedback: "Correct",
            incorrectFeedback: "Incorrect",
          },
          content: [
            { questionText, __type: "QuestionText" },
            ...(imageUri ? [{ imageUri, __type: "ImageURI" }] : []),
          ],
          options: q.options.map((optHtml) => convertHtmlToPlainText(optHtml)),
        },
      };
    }),
  };

  try {
    const res = await fetch("{localhost}/api/{}", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Download failed");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    /*a.download = "questions.zip";*/
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error", err);
    alert("Failed to generate and download questions.");
  }
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
            className="cursor-pointer rounded-lg flex justify-between items-center px-2 py-1 bg-[oklch(21%_0_0)] hover:bg-[oklch(19%_0_0)]"
            onClick={() => onEdit(q)}
          >
            <div className="flex items-start gap-2">
              <span className="font-semibold">{index + 1}.</span>
              <div className="line-clamp-1">{q.displayText || "Question"}</div>
            </div>
            <button
              className="p-1"
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
          <Button variant="secondary" onClick={() => handlePreview(questions)}>
            preview
          </Button>
        </div>
      </div>
    </div>
  );
}
