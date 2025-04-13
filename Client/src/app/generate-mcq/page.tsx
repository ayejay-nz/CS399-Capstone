"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import Tiptap from "@/src/components/ui/tiptap";

export default function GenerateMCQ() {
  const [questionEditor, setQuestionEditor] = useState(null);
  const [optionEditors, setOptionEditors] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeButton, setActiveButton] = useState("form");

  const handleAddOrUpdateQuestion = () => {
    const content = questionEditor.getHTML();
    const options = optionEditors.map((editor) => editor.getHTML());
    if (currentQuestionId !== null) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestionId ? { ...q, content, options } : q,
        ),
      );
    } else {
      setQuestions((prev) => [...prev, { id: Date.now(), content, options }]);
    }

    questionEditor.commands.setContent("");
    optionEditors.forEach((editor) => editor.commands.setContent(""));
    setCurrentQuestionId(null);
  };

  const handleEdit = (q) => {
    questionEditor.commands.setContent(q.content);
    q.options.forEach((optContent, i) => {
      optionEditors[i].commands.setContent(optContent);
    });
    setCurrentQuestionId(q.id);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* nav bar */}
        <nav className="flex justify-between items-center px-8 md:px-12 lg:px-16 py-4">
          <div className="pl-2">
            <Link href="/" className="block">
              <Image
                src="/assets/shuffleLogo.png"
                alt="Shuffle Logo"
                width={140}
                height={32}
                className="w-auto h-6 md:h-8"
              />
            </Link>
          </div>
          <div className="space-x-4 md:space-x-8 pr-2">
            <Link
              href="/docs"
              className="hover:text-gray-300 text-sm md:text-base"
            >
              Documentation
            </Link>
            <Link
              href="/about"
              className="hover:text-gray-300 text-sm md:text-base"
            >
              About
            </Link>
          </div>
        </nav>

        <div
          className="flex-grow justify-between items-center px-8 md:px-12 lg:px-16 py-4"
          style={{ backgroundColor: "oklch(18% 0 0)" }}
        >
          <div className="flex justify-between gap-4 mb-8 mt-5">
            <div className="flex bg-white rounded-3xl p-1">
              <Button
                variant={activeButton === "text" ? "switch" : "secondary"}
                onClick={() => setActiveButton("text")}
              >
                text editor
              </Button>
              <Button
                variant={activeButton === "form" ? "switch" : "secondary"}
                onClick={() => setActiveButton("form")}
              >
                form editor
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">upload file</Button>
              <Button variant="secondary">generate exam</Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left box */}
            <div
              className="flex-1 rounded-lg p-6 pr-10"
              style={{ backgroundColor: "oklch(23% 0 0)" }}
            >
              <h1 className="text-2xl font-bold mb-6">Question</h1>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8">Q.</span>
                <div className="flex-1">
                <Tiptap setEditor={setQuestionEditor} allowImageUpload />
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Options</h2>
                <div className="flex flex-col gap-4">
                  {["A", "B", "C", "D", "E"].map((optionss, i) => (
                    <div key={optionss} className="flex items-center gap-2">
                      <span className="font-medium w-8">{optionss})</span>
                      <div className="flex-1">
                        <Tiptap
                          setEditor={(editor) =>
                            setOptionEditors((prev) => {
                              const updated = [...prev];
                              updated[i] = editor;
                              return updated;
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleAddOrUpdateQuestion}
                  >
                    {currentQuestionId ? "update question" : "add question"}
                  </Button>
                  {currentQuestionId && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        questionEditor.commands.setContent("");
                        optionEditors.forEach((editor) =>
                          editor.commands.setContent(""),
                        );
                        setCurrentQuestionId(null);
                      }}
                    >
                      cancel edit
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right box */}
            <div
              className="lg:w-[400px] rounded-lg p-6 flex flex-col justify-between"
              style={{
                backgroundColor: "oklch(23% 0 0)",
                height: "605px",
              }}
            >
              <div className="overflow-y-auto pr-1 flex-1 space-y-4">
                <h2 className="text-xl font-bold mb-4">Questions</h2>
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="cursor-pointer p-2 rounded-lg border border-gray-600 hover:outline hover:outline-gray-500 flex justify-between items-start"
                    onClick={() => handleEdit(q)}
                  >
                    <div>
                      <div className="font-semibold">Question {index + 1}</div>
                      <div
                        className="text-sm text-gray-400 mt-1"
                        dangerouslySetInnerHTML={{
                          __html:
                            q.content.length > 40
                              ? q.content.slice(0, 40) + "..."
                              : q.content,
                        }}
                      />
                    </div>
                    <button
                      className="text-xl p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuestions((prev) =>
                          prev.filter((item) => item.id !== q.id),
                        );
                      }}
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuestions([]);
                    setCurrentQuestionId(null);
                    questionEditor.commands.setContent("");
                    optionEditors.forEach((e) => e.commands.setContent(""));
                  }}
                >
                  Clear Questions
                </Button>
              </div>
            </div>
          </div>

          <footer className="px-8 py-4 text-right mt-6">
            <div className="text-xs md:text-sm text-gray-400">
              Happy Coders 2025 © All rights reserved
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
