"use client";
import { useState, useEffect } from "react";

export function useMcq() {
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
  const extractTextFromHTML = (html) => {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };
  const adjustMarks = (amount) => {
    const newMarks = Math.max(1, marks + amount);
    setMarks(newMarks);
  };
  const handleAddOrUpdateQuestion = () => {
    const content = questionEditor.getHTML();
    const options = optionEditors.map((editor) => editor.getHTML());
    const displayText = extractTextFromHTML(content) || "Question";
    if (currentQuestionId !== null) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestionId
            ? { ...q, content, options, marks, displayText }
            : q,
        ),
      );
    } else {
      setQuestions((prev) => [
        ...prev,
        { id: Date.now(), content, options, marks, displayText },
      ]);
    }

    questionEditor.commands.setContent("");
    optionEditors.forEach((editor) => editor.commands.setContent(""));
    setCurrentQuestionId(null);
    setMarks(1);
  };
  const handleEdit = (q: any) => {
    setEditingQuestion(q);
    setCurrentQuestionId(q.id);
    setOptionCount(q.options.length);
    setOptionEditors(Array(q.options.length).fill(null)); 
    setMarks(q.marks || 1);
  };
  useEffect(() => {
    if (
      editingQuestion &&
      optionEditors.length === editingQuestion.options.length &&
      optionEditors.every((editor) => editor !== null) &&
      questionEditor !== null
    ) {
      // Set question content
      questionEditor.commands.setContent(editingQuestion.content);

      // Set options content
      editingQuestion.options.forEach((opt: string, index: number) => {
        optionEditors[index].commands.setContent(opt);
      });

      // Clear editing state
      setEditingQuestion(null);
    }
  }, [editingQuestion, optionEditors, questionEditor]);

  // const simulateProcessQuestions = async (file: File) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     const res = await fetch("{localhost}/api/{}", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!res.ok) {
  //       throw new Error("File upload failed");
  //     }

  //     const data = await res.json();
  //     handleProcessedQuestions(data);
  //   } catch (err) {
  //     console.error("Error uploading and processing file:", err);
  //     alert("Failed to upload and process the file.");
  //   }
  // };
  const simulateProcessQuestions = async (file: File) => {
    try {
      const fileText = await file.text();
      const data = JSON.parse(fileText);
      handleProcessedQuestions(data);
    } catch (err) {
      console.error("Error processing file:", err);
      alert("Failed to process the file. Make sure it's valid JSON.");
    }
  };

  const handleProcessedQuestions = (data) => {
    const newQuestions = data.content.map(({ question }) => {
      const questionTextObj = question.content.find(
        (c) => c.__type === "QuestionText",
      );
      const imageUriObj = question.content.find((c) => c.__type === "ImageURI");

      let htmlContent = "";
      if (questionTextObj)
        htmlContent += `<p>${questionTextObj.questionText}</p>`;
      if (imageUriObj) htmlContent += `<img src="${imageUriObj.imageUri}" />`;

      return {
        id: Date.now() + Math.random(),
        content: htmlContent,
        displayText: questionTextObj?.questionText || "Question",
        options: question.options.map((opt) => `<p>${opt}</p>`),
        marks: question.marks || 1,
        optionCount: question.options.length,
      };
    });

    setQuestions(newQuestions);
    questionEditor?.commands.setContent("");
    optionEditors.forEach((e) => e?.commands.setContent(""));
    setCurrentQuestionId(null);
    setMarks(1);
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
  };
}
