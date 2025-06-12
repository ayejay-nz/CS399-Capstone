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
import { ApiSuccessResponse } from "../../../../Server/src/dataTypes/apiSuccessResponse";

import {
  AppendixPage,
  Coverpage,
  CoverpageDocx,
} from "../../../../Server/src/dataTypes/coverpage";
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

const handleBackCoverPage = () => {
  mcq.setCurrentQuestionId(null);
  setSelectedId(null);

  mcq.setOptionEditors(Array(5).fill(null));
  mcq.setOptionContents(Array(5).fill(""));
  mcq.setOptionCount(5);
  mcq.setOptionIds(
    Array(5)
      .fill(null)
      .map(() => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  );
  mcq.setMarks(1);
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
      const res = await fetch("/api/v1/cover-page/upload-file", {
        method: "POST",
        body: formData,
      });

      let responseData;
      const contentType = res.headers.get("Content-Type");
      console.log("Response Content-Type:", contentType);

      if (contentType && contentType.includes("application/json")) {
        responseData = await res.json();
        console.log("JSON Response Data:", responseData);
      } else {
        responseData = await res.text();
        console.log("Text Response Data:", responseData);
      }

      if (!res.ok) {
        console.log("Error Response:", {
          status: res.status,
          statusText: res.statusText,
          responseData,
        });

        if (
          responseData &&
          typeof responseData === "object" &&
          responseData.message
        ) {
          toast.error(responseData.message);
        } else if (
          typeof responseData === "string" &&
          responseData.length > 0
        ) {
          toast.error(`Server error: ${responseData}`);
        } else {
          toast.error(`Server error: ${res.status} ${res.statusText}`);
        }
        return;
      }

      const { data: coverpageJson } =
        responseData as ApiSuccessResponse<CoverpageDocx>;
      if (!coverpageJson) {
        toast.error("No coverpage data received from server.");
        return;
      }
      setCoverPage((prev) => ({
        ...prev,
        isImported: true,
      }));
      toast.success(responseData.message);

      // Add appendices
      const isAppendix = (
        page: Coverpage | AppendixPage,
      ): page is AppendixPage => {
        return "appendix" in page;
      };
      const appendices = coverpageJson.content.filter((page) =>
        isAppendix(page),
      );

      // Create new appendix entries for each appendix found
      const newAppendices = appendices.map((appendix, index) => {
        const htmlContent = getAppendixHtml(appendix);
        return {
          id: Date.now() + index, // Ensure unique IDs
          content: htmlContent,
          options: Array(5).fill(""),
          marks: 0,
          displayText: "Appendix",
          isAppendix: true,
          isImported: true,
        };
      });

      // Add all appendices together
      mcq.setQuestions((prev) => [...prev, ...newAppendices]);

      if (newAppendices.length > 0) {
        toast.success(
          `${newAppendices.length} appendix(es) uploaded successfully`,
        );
      }
    } catch (err) {
      console.error("Error uploading cover page:", err);
      toast.error("Failed to connect to server");
    }
  };

  const getAppendixHtml = (appendix: AppendixPage) => {
    let htmlContent = "";
    appendix.appendix.content.forEach((item: any) => {
      if (item.__type === "AppendixText") {
        htmlContent += `<p>${item.appendixText}</p>`;
      } else if (item.__type === "ImageURI") {
        htmlContent += `<img src="${item.imageUri}" />`;
      } else if (item.__type === "TableURI") {
        htmlContent += `<table>${item.tableUri}</table>`;
      }
    });
    return htmlContent;
  };

  const handleUploadAppendix = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("coverPageFile", file);

      const res = await fetch("/api/v1/appendix/upload-file", {
        method: "POST",
        body: formData,
      });

      // Always attempt to parse as JSON if the content type is JSON
      let responseData;
      const contentType = res.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      if (!res.ok) {
        if (
          responseData &&
          typeof responseData === "object" &&
          responseData.message
        ) {
          toast.error(responseData.message);
        } else if (
          typeof responseData === "string" &&
          responseData.length > 0
        ) {
          toast.error(`Server error: ${responseData}`);
        } else {
          toast.error(`Server error: ${res.status} ${res.statusText}`);
        }
        return;
      }

      // Assume successful response always JSON and has expected structure
      const { data } = responseData;

      let htmlContent = getAppendixHtml(data);

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
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(
        "Network error or unexpected response format. Please try again.",
      );
    }
  };

  const renderForm = () => {
    if (mcq.currentQuestionId === -1) {
      if (coverPage.isImported) {
        return (
          <CustomCover
            onReset={handleResetCoverPage}
            onBack={handleBackCoverPage}
            onUpload={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".docx,.txt,.xml,.tex";
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
          onUpload={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.onchange = (e) => handleUploadCoverPage(e as any);
            input.click();
          }}
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
          handleAddOrUpdate={mcq.handleAddOrUpdateQuestion}
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
        handleAddOrUpdate={mcq.handleAddOrUpdateQuestion}
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
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col relative overflow-hidden">
      <Navbar />

      <div className="flex-grow justify-between items-center px-8 md:px-12 lg:px-16 pt-4 pb-4">
        <div className="flex justify-end mb-4 border-[#27272a]">
          {/* <span className="text-2xl font-bold pl-12">Generate MCQ</span> */}
          <Toolbar
            mode={mcq.activeButton}
            setMode={mcq.setActiveButton}
            onUpload={mcq.simulateProcessQuestions}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {renderForm()}

          <QuestionList
            coverPage={coverPage}
            questions={mcq.questions}
            onEdit={mcq.handleEdit}
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
