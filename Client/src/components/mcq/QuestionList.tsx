"use client";

import { Button } from "@/src/components/ui/button";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically load the PdfSlideOver component
const PdfSlideOver = dynamic(
  () => import("./PdfSlideOver").then((mod) => mod.PdfSlideOver),
  { ssr: false }
);


interface Question {
  id: number;
  content: string;
  options: string[];
  marks: number;
  displayText?: string;
}

interface Props {
  coverPage: Question;
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
  onReorder: (updated: Question[]) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
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
          options: q.options.map((optHtml) =>
            convertHtmlToPlainText(optHtml)
          ),
        },
      };
    }),
  };

  try {
    const res = await fetch(
      "http://localhost:8000/api/v1/exam-source/upload-json",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error", err);
    alert("Failed to generate and download questions.");
  }
}

async function handlePreview2(
  questions: Question[],
  setPreviewUrl: (url: string | null) => void
) {
  const payload = {
    exam: {
      title: "Preview Exam",
      content: questions.map((q, idx) => ({
        question: {
          id: idx + 1,
          marks: q.marks ?? 1,
          feedback: {
            correctFeedback: "Correct",
            incorrectFeedback: "Incorrect",
          },
          content: [
            {
              questionText: convertHtmlToPlainText(q.content),
              __type: "QuestionText",
            },
            ...(function () {
              const m = q.content.match(/<img[^>]+src="([^">]+)"/);
              return m ? [{ imageUri: m[1], __type: "ImageURI" }] : [];
            })(),
          ],
          options: q.options.map((opt) =>
            convertHtmlToPlainText(opt)
          ),
        },
      })),
    },
  };

  try {
    const res = await fetch(
      "http://localhost:8000/api/v1/exam-bundle/preview-pdf",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) throw new Error(res.statusText);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  } catch (err) {
    console.error("Preview error", err);
    alert("Failed to generate preview.");
  }
}

export default function QuestionList({
  coverPage,
  questions,
  onEdit,
  onDelete,
  onClearAll,
  onReorder,
  selectedId,
  setSelectedId,
}: Props) {

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const updated = [...questions];
    const [movedItem] = updated.splice(source.index, 1);
    updated.splice(destination.index, 0, movedItem);
    onReorder(updated);
  };

return (
  <>
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

        <div
          className={`cursor-pointer rounded-lg flex justify-between items-center px-2 py-1 mb-4 ${
            coverPage.id === selectedId
              ? "bg-[oklch(19%_0_0)]"
              : "bg-[oklch(21%_0_0)]"
          } hover:bg-[oklch(19%_0_0)] transition-colors`}
          onClick={() => {
            setSelectedId(coverPage.id);
            onEdit(coverPage);
          }}
        >
          <div className="flex items-start gap-2">
            <span className=""></span>
            <div className="line-clamp-1">
              {coverPage.displayText || "Cover Page"}
            </div>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {questions.map((q, index) => (
                  <Draggable
                    key={q.id}
                    draggableId={q.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`cursor-pointer rounded-lg flex justify-between items-center px-2 py-1 mb-4 ${
                          q.id === selectedId
                            ? "bg-[oklch(19%_0_0)]"
                            : "bg-[oklch(21%_0_0)]"
                        } hover:bg-[oklch(19%_0_0)] transition-colors ${
                          snapshot.isDragging ? "opacity-80" : ""
                        }`}
                        onClick={() => {
                          setSelectedId(q.id);
                          onEdit(q);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-semibold">{index + 1}.</span>
                          <div className="line-clamp-1">
                            {q.displayText || "Question"}
                          </div>
                        </div>
                        <button
                          className="p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(q.id);
                            if (selectedId === q.id) setSelectedId(null);
                          }}
                        >
                          {/* delete icon SVG */}
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* GENERATE & PREVIEW */}
      <div className="mt-auto pt-4">
        <hr className="w-full border-gray-600" />
        <div className="flex justify-between mt-4 space-x-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => handlePreview2(questions, setPreviewUrl)}
          >
            Preview
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => handlePreview(questions)}
          >
            Generate
          </Button>
        </div>
      </div>
    </div>

    {/* PDF slide-over */}
    {previewUrl && (
      <PdfSlideOver
        fileUrl={previewUrl}
        onClose={() => {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }}
      />
    )}
  </>
);
}
