"use client";
import { useState } from "react";
import { useMcq } from "@/src/features/mcq/useMcq";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import QuestionForm from "@/src/components/mcq/QuestionForm";
import AppendixForm from "@/src/components/mcq/AppendixForm";
import QuestionList from "@/src/components/mcq/QuestionList";
import CoverPageForm from "@/src/components/mcq/CoverPageForm";
import CustomCover from "@/src/components/mcq/CustomCover";
import CustomAppendix from "@/src/components/mcq/CustomAppendix";
import Toolbar from "@/src/components/mcq/Toolbar";
import { toast } from "sonner";
export default function GenerateMCQPage() {
  const mcq = useMcq();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [coverPage, setCoverPage] = useState({
    id: -1,
    semester: "",
    campus: "",
    department: "",
    courseCode: "",
    courseName: "",
    examTitle: "",
    duration: "",
    versionNumber: "",
    noteContent: "",
    isImported: false,
  });

  const handleAddOrUpdateQuestion = () => {
    if (!mcq.questionEditor) return;

    const content = mcq.questionEditor.getHTML();
    const displayText = mcq.questionEditor.getText().trim() || "Question";
    const options = mcq.optionContents;
    const marks = mcq.marks;

    if (mcq.currentQuestionId !== null) {
      mcq.setQuestions((prev) =>
        prev.map((q) =>
          q.id === mcq.currentQuestionId
            ? {
                ...q,
                content,
                options,
                marks,
                displayText: q.isAppendix ? "Appendix" : displayText,
              }
            : q,
        ),
      );
    } else {
      const newQuestion = {
        id: Date.now(),
        content,
        options,
        marks,
        displayText,
        optionIds: [...mcq.optionIds],
      };
      mcq.setQuestions((prev) => [...prev, newQuestion]);
    }

    mcq.questionEditor.commands.setContent("");
    mcq.optionEditors.forEach((e: any) => e?.commands.setContent(""));
    mcq.setCurrentQuestionId(null);
    mcq.setMarks(1);
    setSelectedId(null);
  };

  const handleCoverPageUpdate = (values: any) => {
    setCoverPage({
      ...coverPage,
      ...values,
    });
    mcq.setCurrentQuestionId(null);
    setSelectedId(null);
    mcq.setOptionEditors(Array(5).fill(null));
    mcq.setOptionContents(Array(5).fill(""));
    mcq.setOptionCount(5);
    mcq.setOptionIds(
      Array(5)
        .fill(null)
        .map(() => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
    );
  };

  const handleEditQuestion = (q: any) => {
    if (q.id === -1) {
      setCoverPage(q);
      mcq.setCurrentQuestionId(-1);
    } else {
      mcq.handleEdit(q);
    }
    setSelectedId(q.id);
  };

  const handleAddAppendix = () => {
    const newAppendix = {
      id: Date.now(),
      content: "",
      options: Array(5).fill(""),
      marks: 0,
      displayText: "Appendix",
      isAppendix: true,
      isImported: false,
    };
    mcq.setQuestions((prev) => [...prev, newAppendix]);
    mcq.questionEditor?.commands.setContent("");
    mcq.setCurrentQuestionId(newAppendix.id);
    setSelectedId(newAppendix.id);
    mcq.setOptionCount(5);
    mcq.setOptionEditors(Array(5).fill(null));
    mcq.setOptionIds(
      Array(5)
        .fill(null)
        .map(() => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
    );
    mcq.setOptionContents(Array(5).fill(""));
  };

  const handleResetCoverPage = () => {
    setCoverPage((prev) => ({
      ...prev,
      isImported: false,
    }));
  };

  const handleResetAppendix = () => {
    if (mcq.currentQuestionId === null) return;

    mcq.setQuestions((prev) =>
      prev.map((q) =>
        q.id === mcq.currentQuestionId && q.isAppendix
          ? { ...q, isImported: false }
          : q,
      ),
    );
  };

  const handleUploadCoverPage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("coverPageFile", file);
      const res = await fetch(
        "http://localhost:8000/api/v1/cover-page/upload-file",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        const errorJson = JSON.parse(errorText);
        toast.error(errorJson.message);
        return;
      }

      toast.success("Cover page uploaded successfully");
    } catch (err) {
      console.error("Error uploading cover page:", err);
      toast.error("Failed to upload cover page");
    }
  };

  const handleUploadAppendix = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("examSourceFile", file);

      const res = await fetch(
        "http://localhost:8000/api/v1/appendix/upload-file",
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.ok) {
        const errorText = await res.text();
        const errorJson = JSON.parse(errorText);
        toast.error(errorJson.message);
        return;
      }

      const { data } = await res.json();

      let htmlContent = "";
      data.appendix.content.forEach((item: any) => {
        if (item.__type === "AppendixText") {
          htmlContent += `<p>${item.appendixText}</p>`;
        } else if (item.__type === "ImageURI") {
          htmlContent += `<img src="${item.imageUri}" />`;
        }
      });

      if (mcq.currentQuestionId !== null) {
        mcq.setQuestions((prev) =>
          prev.map((q) =>
            q.id === mcq.currentQuestionId && q.isAppendix
              ? {
                  ...q,
                  isImported: true,
                  content: htmlContent,
                  displayText: "Appendix",
                }
              : q,
          ),
        );

        mcq.questionEditor?.commands.setContent(htmlContent);
        toast.success("Appendix uploaded successfully");
      }
    } catch (err) {
      console.error("Error uploading appendix:", err);
      toast.error("Failed to upload appendix");
    }
  };

  const renderForm = () => {
    if (mcq.currentQuestionId === -1) {
      if (coverPage.isImported) {
        return (
          <CustomCover
            onReset={handleResetCoverPage}
            onUpload={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".doc,.docx,.pdf";
              input.onchange = (e) => handleUploadCoverPage(e as any);
              input.click();
            }}
          />
        );
      }
      return (
        <CoverPageForm
          handleAddOrUpdate={handleCoverPageUpdate}
          cancelEdit={() => {
            mcq.setCurrentQuestionId(null);
            setSelectedId(null);
            mcq.setOptionEditors(Array(5).fill(null));
            mcq.setOptionContents(Array(5).fill(""));
            mcq.setOptionCount(5);
            mcq.setOptionIds(
              Array(5)
                .fill(null)
                .map(
                  () =>
                    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                ),
            );
          }}
          initialValues={coverPage}
        />
      );
    }

    const currentQuestion = mcq.questions.find(
      (q) => q.id === mcq.currentQuestionId,
    );
    const isAppendix = currentQuestion?.isAppendix;

    if (isAppendix) {
      return (
        <AppendixForm
          questionEditor={mcq.questionEditor}
          setQuestionEditor={mcq.setQuestionEditor}
          currentQuestionId={mcq.currentQuestionId}
          handleAddOrUpdate={handleAddOrUpdateQuestion}
          cancelEdit={() => {
            mcq.questionEditor?.commands.setContent("");
            mcq.setCurrentQuestionId(null);
            setSelectedId(null);
          }}
          content={currentQuestion?.content}
          onUploadFile={handleUploadAppendix}
        />
      );
    }

    return (
      <QuestionForm
        questionEditor={mcq.questionEditor}
        setQuestionEditor={mcq.setQuestionEditor}
        optionEditors={mcq.optionEditors}
        setOptionEditors={mcq.setOptionEditors}
        currentQuestionId={mcq.currentQuestionId}
        handleAddOrUpdate={handleAddOrUpdateQuestion}
        cancelEdit={() => {
          mcq.questionEditor?.commands.setContent("");
          mcq.optionEditors.forEach((e: any) => e?.commands.setContent(""));
          mcq.setCurrentQuestionId(null);
          mcq.setMarks(1);
          setSelectedId(null);
        }}
        marks={mcq.marks}
        adjustMarks={mcq.adjustMarks}
        optionCount={mcq.optionCount}
        setOptionCount={mcq.setOptionCount}
        optionIds={mcq.optionIds}
        setOptionIds={mcq.setOptionIds}
        version={mcq.version}
        optionContents={mcq.optionContents}
        setOptionContents={mcq.setOptionContents}
        questions={mcq.questions}
      />
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <Navbar />

      <div
        className="flex-grow justify-between items-center px-8 md:px-12 lg:px-16 py-4"
        style={{ backgroundColor: "oklch(18% 0 0)" }}
      >
        <Toolbar
          mode={mcq.activeButton}
          setMode={mcq.setActiveButton}
          onUpload={mcq.simulateProcessQuestions}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {renderForm()}

          <QuestionList
            coverPage={coverPage}
            questions={mcq.questions}
            onEdit={handleEditQuestion}
            onDelete={(id) => {
              if (id === -1) {
                setCoverPage({
                  id: -1,
                  semester: "",
                  campus: "",
                  department: "",
                  courseCode: "",
                  courseName: "",
                  examTitle: "",
                  duration: "",
                  versionNumber: "",
                  noteContent: "",
                  isImported: false,
                });
              } else {
                mcq.setQuestions((prev) => prev.filter((q) => q.id !== id));
              }
              mcq.setCurrentQuestionId(null);
              mcq.questionEditor?.commands.setContent("");
              mcq.optionEditors.forEach((e: any) => e?.commands.setContent(""));
              mcq.setMarks(1);
              if (selectedId === id) setSelectedId(null);
            }}
            onClearAll={() => {
              setCoverPage({
                id: -1,
                semester: "",
                campus: "",
                department: "",
                courseCode: "",
                courseName: "",
                examTitle: "",
                duration: "",
                versionNumber: "",
                noteContent: "",
                isImported: false,
              });
              mcq.setQuestions([]);
              mcq.setCurrentQuestionId(null);
              mcq.questionEditor?.commands.setContent("");
              mcq.setOptionEditors(Array(5).fill(null));
              mcq.setOptionContents(Array(5).fill(""));
              mcq.setOptionCount(5);
              mcq.setOptionIds(
                Array(5)
                  .fill(null)
                  .map(
                    () =>
                      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  ),
              );
              mcq.setMarks(1);
              setSelectedId(null);
              mcq.setVersion((prev) => prev + 1);
            }}
            onReorder={(updated) => mcq.setQuestions(updated)}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onAddAppendix={handleAddAppendix}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
