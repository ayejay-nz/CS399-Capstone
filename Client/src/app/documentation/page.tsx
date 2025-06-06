"use client";
import { useState } from "react";
import Navbar from "@/src/components/layout/Navbar";

export default function Documentation() {
  const [activeItem, setActiveItem] = useState("overview");
  const sections = [
    {
      id: "generate-exam",
      title: "Generate Exam",
      subsections: [
        { id: "overview", title: "Overview" },
        { id: "question-management", title: "Question Management" },
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
              <p className="text-gray-300">Generate Exam</p>
            </section>

            <section
              id="question-management"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Question Management</h2>
              <p className="text-gray-300">Create and edit</p>
            </section>

            <section
              id="option-management"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Option Management</h2>
              <p className="text-gray-300">manage multiple options</p>
            </section>

            <section
              id="cover-page"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Cover Page</h2>
              <p className="text-gray-300">cover page</p>
            </section>

            <section
              id="appendix"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white mb-4">Appendix</h2>
              <p className="text-gray-300">Appendix</p>
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
