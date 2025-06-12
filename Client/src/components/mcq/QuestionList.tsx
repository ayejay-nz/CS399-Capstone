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
import { toast } from "sonner";

// Dynamically load the PdfSlideOver component
const PdfSlideOver = dynamic(
  () => import("./PdfSlideOver").then((mod) => mod.PdfSlideOver),
  { ssr: false },
);

interface Question {
  id: number;
  content?: string;
  options?: string[];
  marks?: number;
  displayText?: string;
  isAppendix?: boolean;
  isImported?: boolean;
}

interface AppendixContent {
  appendixText?: string;
  imageUri?: string;
  __type: "AppendixText" | "ImageURI";
}

interface Props {
  coverPage: {
    id: number;
    semester: string;
    campus: string;
    department: string;
    courseCode: string;
    courseName: string;
    examTitle: string;
    duration: string;
    versionNumber: string;
    noteContent: string;
    isImported?: boolean;
  };
  questions: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
  onReorder: (updated: Question[]) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  onAddAppendix: () => void;
}

function convertHtmlToPlainText(html: string) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

async function handlePreview(
  questions: Question[],
  coverPage: any
) {
  let questionCounter = 0;

  const payload = {
    content: [
      {
        coverpage: {
          isUploaded: coverPage.isImported,
          content: coverPage.isImported
            ? { XML: coverPage.content || "" }
            : {
                semester: coverPage.semester,
                campus: coverPage.campus,
                department: coverPage.department,
                courseCode: coverPage.courseCode,
                courseName: coverPage.courseName,
                examTitle: coverPage.examTitle,
                duration: coverPage.duration,
                noteContent: coverPage.noteContent,
                versionNumber: coverPage.versionNumber,
              },
        },
      },
      ...questions.map((q) => {
        if (q.isAppendix) {
          const temp = document.createElement("div");
          temp.innerHTML = q.content || "";
          const content: AppendixContent[] = [];
          temp.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
              content.push({
                appendixText: node.textContent.trim(),
                __type: "AppendixText",
              });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (el.tagName === "P" && el.textContent?.trim()) {
                content.push({
                  appendixText: el.textContent.trim(),
                  __type: "AppendixText",
                });
              } else if (el.tagName === "IMG") {
                content.push({
                  imageUri: el.getAttribute("src") || "",
                  __type: "ImageURI",
                });
              }
            }
          });
          return {
            appendix: {
              isUploaded: q.isImported || false,
              content,
            },
          };
        } else {
          questionCounter++;
          const questionText = convertHtmlToPlainText(q.content || "");
          const imgMatch = q.content?.match(/<img[^>]+src="([^">]+)"/);
          const imageUri = imgMatch?.[1] || "";

          return {
            question: {
              id: questionCounter,
              marks: q.marks || 1,
              feedback: {
                correctFeedback: "Correct",
                incorrectFeedback: "Incorrect",
              },
              content: [
                { questionText, __type: "QuestionText" },
                ...(imageUri ? [{ imageUri, __type: "ImageURI" }] : []),
              ],
              options: q.options?.map(convertHtmlToPlainText) || [],
            },
          };
        }
      }),
    ],
  };

  try {
    const res = await fetch("/api/v1/exam-source/upload-json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      const err = JSON.parse(text);
      toast.error(err.message);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Exam generated successfully");
  } catch (err) {
    console.error("Error", err);
    toast.error("Failed to generate and download questions");
  }
}

async function handlePreview2(
  questions: Question[],
  coverPage: any,
  setPreviewUrl: (url: string | null) => void
) {
  let questionCounter = 0;

  const payload = {
    exam: {
      content: [
        {
          coverpage: {
            isUploaded: coverPage.isImported,
            content: coverPage.isImported
              ? { XML: coverPage.content || "" }
              : {
                  semester: coverPage.semester,
                  campus: coverPage.campus,
                  department: coverPage.department,
                  courseCode: coverPage.courseCode,
                  courseName: coverPage.courseName,
                  examTitle: coverPage.examTitle,
                  duration: coverPage.duration,
                  noteContent: coverPage.noteContent,
                  versionNumber: coverPage.versionNumber,
                },
          },
        },
        ...questions.map((q) => {
          if (q.isAppendix) {
            // same appendix logic
            const temp = document.createElement("div");
            temp.innerHTML = q.content || "";
            const content: AppendixContent[] = [];
            temp.childNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                content.push({
                  appendixText: node.textContent.trim(),
                  __type: "AppendixText",
                });
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                if (el.tagName === "P" && el.textContent?.trim()) {
                  content.push({
                    appendixText: el.textContent.trim(),
                    __type: "AppendixText",
                  });
                } else if (el.tagName === "IMG") {
                  content.push({
                    imageUri: el.getAttribute("src") || "",
                    __type: "ImageURI",
                  });
                }
              }
            });
            return {
              appendix: {
                isUploaded: q.isImported || false,
                content,
              },
            };
          } else {
            questionCounter++;
            const questionText = convertHtmlToPlainText(q.content || "");
            const imgMatch = q.content?.match(/<img[^>]+src="([^">]+)"/);
            const imageUri = imgMatch?.[1] || "";

            return {
              question: {
                id: questionCounter,
                marks: q.marks || 1,
                feedback: {
                  correctFeedback: "Correct",
                  incorrectFeedback: "Incorrect",
                },
                content: [
                  { questionText, __type: "QuestionText" },
                  ...(imageUri ? [{ imageUri, __type: "ImageURI" }] : []),
                ],
                options: q.options?.map(convertHtmlToPlainText) || [],
              },
            };
          }
        }),
      ],
    },
  };

  console.log(payload);

  try {
    const res = await fetch("/api/v1/exam-bundle/preview-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      const err = JSON.parse(text);
      toast.error(err.message);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    toast.success("Preview generated successfully");
  } catch (err) {
    console.error("Preview error", err);
    toast.error("Failed to generate preview");
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
  onAddAppendix,
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
        className="lg:w-[400px] rounded-lg p-6 flex flex-col border border-[#27272a]"
        style={{ height: "665px" }}
      >
        <div className="flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Edit Examination</h2>
            <button
              className="text-base text-gray-300 hover:text-white underline underline-offset-2 transition-colors"
              onClick={onClearAll}
            >
              Clear All
            </button>
          </div>

          <div
            className={`cursor-pointer rounded-lg flex justify-between items-center px-2 py-1 mb-4 ${
              coverPage.id === selectedId
                ? "bg-[oklch(19%_0_0)]"
                : "bg-[oklch(0_0_0)]"
            } hover:bg-[oklch(19%_0_0)] transition-colors`}
            onClick={() => {
              setSelectedId(coverPage.id);
              onEdit(coverPage as Question);
            }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-bold truncate">Cover Page</span>
            </div>
          </div>
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="questions-list">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {questions.map((q, index) => {
  
              const questionNumber = questions
                .slice(0, index + 1)
                .filter(item => !item.isAppendix).length;
              return (
                <Draggable key={q.id} draggableId={q.id.toString()} index={index}>
                  {(prov, snapshot) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      className={`cursor-pointer rounded-lg flex justify-between items-center px-2 py-1 mb-4 ${
                        q.id === selectedId
                          ? "bg-[oklch(19%_0_0)] border border-[#27272A]"
                          : "bg-[oklch(0_0_0)]"
                      } hover:bg-[oklch(19%_0_0)] transition-colors ${
                        snapshot.isDragging ? "opacity-80" : ""
                      }`}
                      onClick={() => {
                        setSelectedId(q.id);
                        onEdit(q);
                      }}
                    >
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold truncate">
                            {q.isAppendix ? "Appendix" : `Question ${questionNumber}`}
                          </span>
                          <div className="truncate">
                            {q.displayText || (q.isAppendix ? "..." : "Question")}
                          </div>
                        </div>
                      </div>

                      <button
                        className="p-1 ml-2 flex-shrink-0 text-gray-400 hover:text-white transition-colors"
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
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>

          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={onAddAppendix}
          >
            + Add Appendix
          </Button>
        </div>

        {/* GENERATE & PREVIEW */}
        <div className="mt-auto pt-4">
          <hr className="w-full border-[#27272a]" />
          <div className="flex justify-between mt-4 space-x-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() =>
                handlePreview2(questions, coverPage, setPreviewUrl)
              }
            >
              Preview
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => handlePreview(questions, coverPage)}
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
