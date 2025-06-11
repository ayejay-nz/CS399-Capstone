"use client";
import { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
// TODO: Why are we importing from Server? We may have to split Client and Server later on
import { ApiSuccessResponse } from "../../../../Server/src/dataTypes/apiSuccessResponse"; // Clean these imports up
import { ExamData } from "../../../../Server/src/dataTypes/examData";
import { toast } from "sonner";

export function useMcq() {
  const [optionContents, setOptionContents] = useState<string[]>([]);
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [questionEditor, setQuestionEditor] = useState<Editor | null>(null);
  const [optionCount, setOptionCount] = useState(5);
  const [optionEditors, setOptionEditors] = useState<(Editor | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(
    null,
  );
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeButton, setActiveButton] = useState<"form" | "text">("form");
  const [marks, setMarks] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [version, setVersion] = useState(0);

  function getTextWithBreaks(editor: Editor): string {
  const doc = editor.getJSON();
  const lines: string[] = [];
  for (const node of doc.content || []) {
    if (node.type === "paragraph" || node.type === "heading") {
      const text = (node.content || []).map((c: any) => c.text || "").join("");
      lines.push(text);
    }
  }
  return lines.join("\n");
}

function textToEditorHtml(text?: string): string {
  if (!text) return "";             
  const trimmed = text.replace(/^\s+/, "");
  return trimmed
    .split(/\n+/)
    .filter(l => l.trim())
    .map(l => `<p>${l.trim()}</p>`)  
    .join("");
}

  const extractTextFromHTML = (html: string) => {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const adjustMarks = (amount: number) => {
    setMarks((prev) => Math.max(0.5, prev + amount));
  };

  const handleAddOrUpdateQuestion = () => {
    if (!questionEditor) return;
    
    const content = getTextWithBreaks(questionEditor);
    const options = optionContents;
    const displayText = extractTextFromHTML(content) || "Question";

    if (currentQuestionId !== null) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestionId
            ? { ...q, content, options, marks, displayText, optionIds }
            : q,
        ),
      );
    } else {
      setQuestions((prev) => [
        ...prev,
        {
          id: Date.now(),
          content,
          options,
          marks,
          displayText,
          optionIds: [...optionIds],
        },
      ]);
    }

    questionEditor.commands.setContent("");
    const initialOptionCount = 5;
    const newOptionIds = Array(initialOptionCount)
      .fill(null)
      .map(generateOptionId);
    setOptionCount(initialOptionCount);
    setOptionIds(newOptionIds);
    setOptionContents(Array(initialOptionCount).fill(""));
    setCurrentQuestionId(null);
    setMarks(1);
    setVersion((prev) => prev + 1);
  };

const handleEdit = (q: any) => {
  setEditingQuestion(q);
  setCurrentQuestionId(q.id);
  const opts = Array.isArray(q.options) ? q.options : [];
  setOptionCount(opts.length);
  setOptionEditors(Array(opts.length).fill(null));
  setOptionContents(opts);
  setOptionIds(
    Array.isArray(q.optionIds)
      ? q.optionIds
      : opts.map((_: any, i: number) => `${q.id}-${i}`)
  );
  setMarks(q.marks ?? 1);
  setVersion((prev) => prev + 1);
};

  const generateOptionId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (editingQuestion && questionEditor) {
      const html = textToEditorHtml(editingQuestion.content);
      questionEditor.commands.setContent(html);
      setTimeout(() => {
        setOptionContents(editingQuestion.options);
        setEditingQuestion(null);
      }, 0);
    }
  }, [editingQuestion, questionEditor]);

  const simulateProcessQuestions = async (file: File) => {
    const formData = new FormData();
    formData.append("examSourceFile", file);

    const res = await fetch(
      "/api/v1/exam-source/upload-file",
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

    const responseJson = await res.json();
    handleProcessedQuestions(responseJson.data);
  };

  const handleProcessedQuestions = (data: any) => {
    if (!data || !data.content || !Array.isArray(data.content)) {
      console.error("Invalid data format:", data);
      toast.error("Invalid data format received from server");
      return;
    }

    if (data.content.length === 0) {
      toast.error("No questions found in the file.");
      return;
    }

    const newQuestions = data.content
      .map(({ question, section }: any) => {
        // Handle both question and section types
        if (question) {
          const questionTextObj = question.content.find(
            (c: any) => c.__type === "QuestionText" || "questionText" in c,
          );
          const imageUriObj = question.content.find(
            (c: any) => c.__type === "ImageURI" || "imageUri" in c,
          );

          let htmlContent = "";
          if (questionTextObj) {
            htmlContent += `<p>${questionTextObj.questionText}</p>`;
          }
          if (imageUriObj) {
            htmlContent += `<img src="${imageUriObj.imageUri}" />`;
          }

          return {
            id: Date.now() + Math.random(),
            content: htmlContent,
            displayText: questionTextObj?.questionText || "Question",
            options: question.options.map((opt: string) => `<p>${opt}</p>`),
            marks: question.marks || 1,
            optionIds: question.options.map(generateOptionId),
          };
        } else if (section) {
          // Handle section type if needed
          // You can return a different format for sections
          const sectionText = section.content?.[0]?.sectionText || "Section";
          return {
            id: Date.now() + Math.random(),
            content: `<p>${sectionText}</p>`,
            displayText: sectionText,
            options: [],
            marks: 0,
            optionIds: [],
            isSection: true,
          };
        }

        return null;
      })
      .filter(Boolean); // Remove any null entries

    const initialOptionCount = 5;
    setQuestions(newQuestions);
    setOptionCount(initialOptionCount);
    setMarks(1);
    setCurrentQuestionId(null);
    setOptionIds(Array(initialOptionCount).fill(null).map(generateOptionId));
    setOptionContents(Array(initialOptionCount).fill(""));
    setOptionEditors(Array(initialOptionCount).fill(null));
    setVersion((prev) => prev + 1);
  };

  return {
    marks,
    setMarks,
    questionEditor,
    setQuestionEditor,
    optionEditors,
    setOptionEditors,
    currentQuestionId,
    setCurrentQuestionId,
    questions,
    setQuestions,
    activeButton,
    setActiveButton,
    handleAddOrUpdateQuestion,
    handleEdit,
    adjustMarks,
    simulateProcessQuestions,
    optionCount,
    setOptionCount,
    optionIds,
    setOptionIds,
    optionContents,
    setOptionContents,
    version,
    setVersion,
  };
}
