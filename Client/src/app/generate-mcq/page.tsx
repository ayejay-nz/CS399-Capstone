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
import { ApiSuccessResponse } from "@/src/dataTypes/apiSuccessResponse";

import {
  AppendixPage,
  Coverpage,
  CoverpageDocx,
} from "@/src/dataTypes/coverpage";
import type { Coverpage as CoverpageWrapper } from "@/src/dataTypes/coverpage";
export default function GenerateMCQPage() {
  const mcq = useMcq();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  type CoverContent = CoverpageWrapper["coverpage"]["content"];
  type AppendixItem = AppendixPage["appendix"]["content"][number];


  interface CoverPageState extends CoverContent {
    id: number;
    isImported: boolean;
  }

  const [coverPage, setCoverPage] = useState<CoverPageState>({
    id: -1,
    semester: "",
    campus: "",
    department: "",
    courseCode: "",
    courseName: "",
    examTitle: "",
    duration: "",
    versionNumber: "original",
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

    const contentType = res.headers.get("Content-Type") || "";
    const responseData =
      contentType.includes("application/json")
        ? await res.json()
        : await res.text();

    if (!res.ok) {
      const msg =
        typeof responseData === "object" && responseData.message
          ? responseData.message
          : typeof responseData === "string"
          ? responseData
          : `${res.status} ${res.statusText}`;
      toast.error(msg);
      return;
    }

    // ← INSERT HERE: pull out the pages array and guard it
    const apiResp = responseData as ApiSuccessResponse<CoverpageDocx>;
    if (!apiResp.data?.content) { toast.error("No pages returned from the server."); return; }
    const rawPages = apiResp.data.content as CoverpageDocx["content"];

    // find the coverpage wrapper
    const coverWrapper = rawPages.find(
      (p): p is CoverpageWrapper => "coverpage" in p
    );

    if (coverWrapper) {
      const parsed = coverWrapper.coverpage.content;
      setCoverPage({
        id: -1,
        ...parsed,         // semester, campus, department, courseCode, courseName, examTitle, duration, noteContent, versionNumber?
        isImported: false, // keep you in the form-editing branch
      });
      toast.success(apiResp.message);
    } else {
      // no coverpage → switch to your CustomCover UI
      setCoverPage(prev => ({ ...prev, isImported: true }));
      return;
    }

    // …and the rest of your appendix logic stays exactly as it is…
    const appendixWrappers = rawPages.filter(
      (p): p is AppendixPage => "appendix" in p
    );
    const newAppendices = appendixWrappers.map((p, idx) => ({
      id: Date.now() + idx,
      content: getAppendixHtml(p.appendix),
      options: Array(5).fill(""),
      marks: 0,
      displayText: "Appendix",
      isAppendix: true,
      isImported: true,
    }));
    mcq.setQuestions(prev => [...prev, ...newAppendices]);
    if (newAppendices.length) {
      toast.success(`${newAppendices.length} appendix(es) uploaded successfully`);
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to connect to server");
  }
};

  const getAppendixHtml = (appendix: AppendixPage["appendix"]) => {
    let html = "";
    appendix.content.forEach(item => {
      if (item.__type === "AppendixText") {
        html += `<p>${item.appendixText}</p>`;
      } else if (item.__type === "ImageURI") {
        html += `<img src="${item.imageUri}" />`;
      } else if (item.__type === "TableURI") {
        html += `<table>${item.tableUri}</table>`;
      }
    });
    return html;
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

      const apiResp = responseData as ApiSuccessResponse<AppendixPage>;
      if (!apiResp.data?.appendix) {
        toast.error("No appendix returned from server.");
        return;
      }
      
      const htmlContent = getAppendixHtml(apiResp.data.appendix);

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
