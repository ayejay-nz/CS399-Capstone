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
        { id: "question-management", title: "Create Questions" },
        { id: "editing-questions", title: "Editing Questions" },
        { id: "option-management", title: "Question Management" },
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
      <div className="border-b border-[#27272A]"></div>
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
                  <h3 className="text-xl text-white">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Rich text editor for question and option content</li>
                    <li>Support for images in questions and options</li>
                    <li>
                      Dynamic option management with correct answer selection
                    </li>
                    <li>Customizable cover page with exam details</li>
                    <li>Appendix support for additional materials</li>
                    <li>Live preview of the exam</li>
                    <li>Export to 4 different versions of the exam</li>
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
                    to questions for better visual representation. The cover
                    page can be customized with exam details, and you can add
                    appendices for supplementary materials.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="question-management"
              className="mb-12 pb-8 border-b border-[#27272A]"
            >
              <h2 className="text-2xl text-white font-semibold mb-4">
                Creating Questions
              </h2>
              <div className="space-y-6">
                <p className="text-gray-300">
                  The question form provides a comprehensive interface for
                  creating exam questions. Begin by setting the marks for the
                  question using the controls in the top right corner. Then,
                  enter your question content in the main editor box, followed
                  by the individual options below. To add more options, use the
                  "Add Option" button at the bottom of the editors. Remove
                  options by clicking the trash icon next to the option you want
                  to delete. Mark the correct answer by selecting the checkbox
                  to the left of the corresponding option. Once you've completed
                  the question, click the "Add Question" button in the top right
                  to save it.
                </p>
                <div className="space-y-4">
                  <h3 className="text-xl text-white">Key Features:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Rich text editors</li>
                    <li>Flexible option control</li>
                    <li>Support for image upload</li>
                  </ul>
                </div>
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
              <h2 className="text-2xl text-white font-semibold mb-4">
                Editing Questions
              </h2>
              <div className="space-y-6">
                <p className="text-gray-300">
                  To edit an existing question, select it from the question list
                  in the right panel. This will load the question into the
                  editor with all its current content and settings. Make your
                  desired changes to the question text, options, or marks. When
                  finished, click "Update" to save your changes or "Cancel" to
                  discard them and return to the previous version.
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
              <h2 className="text-2xl text-white mb-4 font-semibold">
                Question Management
              </h2>
              <div className="space-y-6">
                <p className="text-gray-300">
                  The question management section in the left panel provides an
                  overview of all created questions that will be included in the
                  exam. You can select any question to review and edit its
                  contents. The interface allows you to reorder questions
                  through drag-and-drop functionality, and you can use the
                  "Clear All" button in the top right to reset all created
                  content.
                </p>
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
              <h2 className="text-2xl text-white mb-4 font-semibold">
                Cover Page
              </h2>
              <div className="space-y-6">
                <p className="text-gray-300">
                  To customize the exam's cover page, select the "Cover Page"
                  option from the questions list. Here you can input essential
                  exam information such as course details, exam title, duration,
                  and any additional notes. The cover page supports both manual
                  input of information and the ability to upload an existing
                  cover page template.
                </p>
                <div className="space-y-4">
                  <h3 className="text-xl text-white">Cover Page Fields:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Semester and Campus information</li>
                    <li>Department and Course details</li>
                    <li>Exam title and duration</li>
                    <li>Version number</li>
                    <li>Additional notes section</li>
                    <li>Option to upload existing cover page</li>
                  </ul>
                </div>
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
              <h2 className="text-2xl text-white mb-4 font-semibold">
                Appendix
              </h2>
              <div className="space-y-6">
                <p className="text-gray-300">
                  To add supplementary materials to your exam, click the "Add
                  Appendix" button at the bottom of the question list section.
                  Appendices can include additional information, reference
                  materials, or any other content that students might need
                  during the exam. The appendix supports both text and image
                  content, allowing you to provide comprehensive supplementary
                  materials.
                </p>
                <div className="space-y-4">
                  <h3 className="text-xl text-white">Appendix Features:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Rich text editor for appendix content</li>
                    <li>Image upload and embedding</li>
                    <li>Multiple appendices support</li>
                    <li>Drag and drop reordering</li>
                    <li>Easy deletion of appendices</li>
                  </ul>
                </div>
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
