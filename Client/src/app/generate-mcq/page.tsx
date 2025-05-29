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

      // Check if coverpage was parsed successfully
      const { data: coverpageJson } =
        (await res.json()) as ApiSuccessResponse<CoverpageDocx>;
      if (!coverpageJson) {
        throw new Error("No coverpage data received from server.");
      }
      setCoverPage((prev) => ({
        ...prev,
        isImported: true,
      }));
      toast.success("Cover page uploaded successfully");
      // Check if coverpage is present
      // Future functionality: Will populate the Coverpage form with the parsed data
      // const isCoverpage = (page: Coverpage | AppendixPage): page is Coverpage => {return 'coverpage' in page}
      // const firstPage = coverpageJson.content[0];
      // if (isCoverpage(firstPage)) {
      //   const coverpage = firstPage.coverpage!;
      //   setCoverPage({
      //     id: -1,
      //     ...coverpage.content,
      //     versionNumber: coverpage.content.versionNumber || "version number",
      //     isImported: true,
      //   })
      //   toast.success("Cover page uploaded successfully");
      // } else {
      //   toast.success("Cover page uploaded successfully -- please edit manually");

      // Add appendicies
      const isAppendix = (
        page: Coverpage | AppendixPage,
      ): page is AppendixPage => {
        return "appendix" in page;
      };
      const appendicies = coverpageJson.content.filter((page) =>
        isAppendix(page),
      );

      // Create new appendix entries for each appendix found
      const newAppendicies = appendicies.map((appendix, index) => {
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
      mcq.setQuestions((prev) => [...prev, ...newAppendicies]);

      if (newAppendicies.length > 0) {
        toast.success(
          `${newAppendicies.length} appendix(es) uploaded successfully`,
        );
      }
    } catch (err) {
      console.error("Error uploading cover page:", err);
      toast.error("Failed to upload cover page");
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
        <div
          className="flex-1 p-6 pr-6 rounded-md"
          style={{ backgroundColor: "oklch(23% 0 0)" }}
        >
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
            onUploadFile={handleUploadCoverPage}
          />
        </div>
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
