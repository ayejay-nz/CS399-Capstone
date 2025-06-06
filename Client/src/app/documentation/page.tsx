"use client";
import { useState } from "react";
import Navbar from "@/src/components/layout/Navbar";
import Image from "next/image";
interface Section {
  id: string;
  title: string;
  subsections: {
    id: string;
    title: string;
  }[];
}

export default function Documentation() {
  const [activeItem, setActiveItem] = useState("overview");
  const sections: Section[] = [
    {
      id: "generate-exam",
      title: "Generate Exam",
      subsections: [
        { id: "overview", title: "Overview" },
        { id: "question-management", title: "Question Management" },
        { id: "editing-questions", title: "Editing Questions" },
        { id: "option-management", title: "Option Management" },
        { id: "cover-page", title: "Cover Page" },
        { id: "appendix", title: "Appendix" },
      ],
    },
    {
      id: "mark-mcq",
      title: "Mark MCQ",
      subsections: [{ id: "overview-marking", title: "Overview" }],
    },
  ];

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="flex">
        <div className="w-64 border-r border-[#27272A] p-4 sticky top-0 h-screen overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4">Documentation</h2>
          <nav className="space-y-4">
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => handleItemClick(section.id)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeItem === section.id
                      ? "bg-[#27272A] text-white"
                      : "text-gray-400 hover:text-white hover:bg-[#27272A]"
                  }`}
                >
                  {section.title}
                </button>
                <div className="ml-4 mt-2 space-y-1">
                  {section.subsections.map((subsection) => (
                    <button
                      key={subsection.id}
                      onClick={() => handleItemClick(subsection.id)}
                      className={`w-full text-left px-4 py-1 text-sm rounded-md transition-colors ${
                        activeItem === subsection.id
                          ? "bg-[#27272A] text-white"
                          : "text-gray-400 hover:text-white hover:bg-[#27272A]"
                      }`}
                    >
                      {subsection.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <section
              id="generate-exam"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h1 className="text-3xl text-white font-bold mb-4">
                Generate Exam
              </h1>
            </section>

            <section
              id="overview"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Overview</h2>
              <div className="space-y-6">
                <p className="text-gray-300">
                  The Generate Exam feature is a powerful tool that allows you
                  to create comprehensive multiple-choice examinations. This
                  feature provides an intuitive interface for creating, editing,
                  and organizing your exam content, including questions,
                  options, cover pages, and appendices.
                </p>

                <div className="space-y-4">
                  <h3 className="text-xl text-white font-semibold">
                    Key Features:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Rich text editor for question and option content</li>
                    <li>Support for images in questions and options</li>
                    <li>
                      Dynamic option management with correct answer selection
                    </li>
                    <li>Customizable cover page with exam details</li>
                    <li>Appendix support for additional materials</li>
                    <li>Live preview of the exam</li>
                    <li>Export to PDF format</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl text-white font-semibold">
                    Getting Started:
                  </h3>
                  <p className="text-gray-300">
                    To create a new exam, start by adding questions using the
                    question editor. Each question can have multiple options,
                    and you can mark the correct answer. You can also add images
                    to both questions and options for better visual
                    representation. The cover page can be customized with exam
                    details, and you can add appendices for supplementary
                    materials.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="question-management"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Creating Questions</h2>
              <div className="space-y-6">
                <p className="text-gray-300">
                  All the tools required to create an exam question is on this
                  section to the left. To create the question, start by
                  adjusting the marks for the question near the top right.
                </p>
                <div className="relative w-full rounded-lg">
                  <Image
                    src="/assets/documentation/question-management.png"
                    alt="Question Management"
                    width={800}
                    height={600}
                  />
                </div>
              </div>
            </section>

            <section
              id="editing-questions"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Editing Questions</h2>
              <div className="space-y-6">
                <p className="text-gray-300">
                  To edit an existing question, click on the question in the
                  question list on the left panel. The question editor will load
                  with the current question content and options. You can modify
                  the question text, options, and marks. Click "Update" to save
                  your changes or "Cancel" to discard them.
                </p>
                <div className="relative w-full rounded-lg">
                  <Image
                    src="/assets/documentation/editing-questions.png"
                    alt="Editing Questions"
                    width={600}
                    height={450}
                  />
                </div>
              </div>
            </section>

            <section
              id="option-management"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Question Management</h2>
              <div className="space-y-6">
                <p className="text-gray-300">question management</p>
                <div className="relative w-full rounded-lg">
                  <Image
                    src="/assets/documentation/option-management.png"
                    alt="Option Management"
                    width={600}
                    height={450}
                  />
                </div>
              </div>
            </section>

            <section
              id="cover-page"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Cover Page</h2>
              <div className="space-y-6">
                <p className="text-gray-300">cover page</p>
                <div className="relative w-full rounded-lg">
                  <Image
                    src="/assets/documentation/cover-page.png"
                    alt="Cover Page"
                    width={600}
                    height={450}
                  />
                </div>
              </div>
            </section>

            <section
              id="appendix"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Appendix</h2>
              <div className="space-y-6">
                <p className="text-gray-300">appendix</p>
                <div className="relative w-full rounded-lg">
                  <Image
                    src="/assets/documentation/appendix.png"
                    alt="Appendix"
                    width={600}
                    height={450}
                  />
                </div>
              </div>
            </section>

            <section
              id="mark-mcq"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h1 className="text-3xl text-white font-bold mb-4">Mark MCQ</h1>
            </section>

            <section
              id="overview-marking"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white font-bold mb-4">Overview</h2>
              <p className="text-gray-300">Mark mcq</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
