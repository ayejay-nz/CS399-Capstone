"use client";
import { useState } from "react";
import { useMcq } from "@/src/features/mcq/useMcq";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import Toolbar from "@/src/components/mcq/Toolbar";
import QuestionForm from "@/src/components/mcq/QuestionForm";
import QuestionList from "@/src/components/mcq/QuestionList";

export default function GenerateMCQPage() {
  const mcq = useMcq();
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
          />

          <QuestionList
            questions={mcq.questions}
            onEdit={(q) => {
              mcq.handleEdit(q);
              setSelectedId(q.id);
            }}
            onDelete={(id) => {
              mcq.setQuestions((prev: any[]) =>
                prev.filter((q) => q.id !== id),
              );
              mcq.setCurrentQuestionId(null);
              mcq.questionEditor?.commands.setContent("");
              mcq.optionEditors.forEach((e: any) => e?.commands.setContent(""));
              mcq.setMarks(1);
              if (selectedId === id) setSelectedId(null);
            }}
            onClearAll={() => {
              mcq.setQuestions([]);
              mcq.setCurrentQuestionId(null);
              mcq.questionEditor?.commands.setContent("");
              mcq.optionEditors.forEach((e: any) => e?.commands.setContent(""));
              mcq.setMarks(1);
              setSelectedId(null);
            }}
            onReorder={(updated) => mcq.setQuestions(updated)}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
