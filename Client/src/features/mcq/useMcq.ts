"use client";
import { useState, useEffect } from "react";
import { ApiSuccessResponse } from "../../../../Server/src/dataTypes/apiSuccessResponse"; // Clean these imports up
import { ExamData } from "../../../../Server/src/dataTypes/examData";

export function useMcq() {
  const [optionContents, setOptionContents] = useState<string[]>([]);
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [questionEditor, setQuestionEditor] = useState(null);
  const [optionCount, setOptionCount] = useState(5);
  const [optionEditors, setOptionEditors] = useState([
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

  const extractTextFromHTML = (html: string) => {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const adjustMarks = (amount: number) => {
    setMarks((prev) => Math.max(1, prev + amount));
  };

  const handleAddOrUpdateQuestion = () => {
    const content = questionEditor.getHTML();
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
    setOptionCount(q.options.length);
    setOptionEditors(Array(q.options.length).fill(null));
    setOptionContents(q.options);
    setOptionIds(
      q.optionIds || q.options.map((_: any, i: number) => `${q.id}-${i}`),
    );
    setMarks(q.marks || 1);
    setVersion((prev) => prev + 1);
  };

  const generateOptionId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (editingQuestion && questionEditor) {
      questionEditor.commands.setContent(editingQuestion.content);
      setTimeout(() => {
        setOptionContents(editingQuestion.options);
        setEditingQuestion(null);
      }, 0);
    }
  }, [editingQuestion, questionEditor]);

  const simulateProcessQuestions = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("examSourceFile", file);

      const res = await fetch(
        "http://localhost:8000/api/v1/exam-source/upload-file",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error("File upload failed");
      }

      // Extract parsed JSON from API response
      const { data: parseResult } =
        (await res.json()) as ApiSuccessResponse<ExamData>;
      handleProcessedQuestions(parseResult);
    } catch (err) {
      console.error("Error uploading and processing file:", err);
      alert("Failed to upload and process the file.");
    }
  };

  // const simulateProcessQuestions = async (file: File) => {
  //   try {
  //     const fileText = await file.text();
  //     const data = JSON.parse(fileText);
  //     handleProcessedQuestions(data);
  //   } catch (err) {
  //     console.error("Error processing file:", err);
  //     alert("Failed to process the file. Make sure it's valid JSON.");
  //   }
  // };

  const handleProcessedQuestions = (data: any) => {
    const newQuestions = data.content.map(({ question }: any) => {
      const questionTextObj = question.content.find(
        (c: any) => c.__type === "QuestionText",
      );
      const imageUriObj = question.content.find(
        (c: any) => c.__type === "ImageURI",
      );

      let htmlContent = "";
      if (questionTextObj)
        htmlContent += `<p>${questionTextObj.questionText}</p>`;
      if (imageUriObj) htmlContent += `<img src="${imageUriObj.imageUri}" />`;

      return {
        id: Date.now() + Math.random(),
        content: htmlContent,
        displayText: questionTextObj?.questionText || "Question",
        options: question.options.map((opt: string) => `<p>${opt}</p>`),
        marks: question.marks || 1,
        optionIds: question.options.map(generateOptionId),
      };
    });

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
  };
}
