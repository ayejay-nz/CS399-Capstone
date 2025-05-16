"use client";
import { Button } from "@/src/components/ui/button";
import { useState } from "react";
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
  console.log(payload);
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <div
      className="lg:w-[400px] rounded-lg p-6 flex flex-col"
      style={{ backgroundColor: "oklch(23% 0 0)", height: "665px" }}
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
            className={`cursor-pointer rounded-lg flex justify-between items-center px-2 py-1 ${
              q.id === selectedId
                ? "bg-[oklch(19%_0_0)]"
                : "bg-[oklch(21%_0_0)]"
            } hover:bg-[oklch(19%_0_0)] transition-colors`}
            onClick={() => {
              setSelectedId(q.id);
              onEdit(q);
            }}
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
                if (selectedId === q.id) setSelectedId(null);
              }}
            >
              <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 3.99967H2.33333M2.33333 3.99967H13M2.33333 3.99967V13.333C2.33333 13.6866 2.47381 14.0258 2.72386 14.2758C2.97391 14.5259 3.31304 14.6663 3.66667 14.6663H10.3333C10.687 14.6663 11.0261 14.5259 11.2761 14.2758C11.5262 14.0258 11.6667 13.6866 11.6667 13.333V3.99967M4.33333 3.99967V2.66634C4.33333 2.31272 4.47381 1.97358 4.72386 1.72353C4.97391 1.47348 5.31304 1.33301 5.66667 1.33301H8.33333C8.68696 1.33301 9.02609 1.47348 9.27614 1.72353C9.52619 1.97358 9.66667 2.31272 9.66667 2.66634V3.99967M5.66667 7.33301V11.333M8.33333 7.33301V11.333"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <div className="flex flex-col items-center space-y-4">
          <hr className="w-full border-gray-600" />
          <Button variant="secondary" onClick={() => handlePreview(questions)}>
            generate
          </Button>
        </div>
      </div>
    </div>
  );
}
