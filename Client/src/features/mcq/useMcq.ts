"use client";
import { useState } from "react";

export function useMcq() {

  const [questionEditor, setQuestionEditor] = useState(null);
  const [optionEditors, setOptionEditors] = useState([null, null, null, null, null]);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeButton, setActiveButton] = useState<"form" | "text">("form");

  const handleAddOrUpdateQuestion = () => {
    const content = questionEditor.getHTML();
    const options = optionEditors.map((editor) => editor.getHTML());

    if (currentQuestionId !== null) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestionId ? { ...q, content, options } : q
        )
      );
    } else {
      setQuestions((prev) => [
        ...prev,
        { id: Date.now(), content, options },
      ]);
    }

    questionEditor.commands.setContent("");
    optionEditors.forEach((editor) => editor.commands.setContent(""));
    setCurrentQuestionId(null);
  };

    const handleEdit = (q: any) => {
    questionEditor.commands.setContent(q.content);
    q.options.forEach((optContent: string, i: number) => {
      optionEditors[i].commands.setContent(optContent);
    });
    setCurrentQuestionId(q.id);
  };

  const handleProcessedQuestions = (data: any) => {
    const newQuestions = data.content.map(({ question }: any) => {
      const questionTextObj = question.content.find(
        (c: any) => c.__type === "QuestionText"
      );
      const imageUriObj = question.content.find(
        (c: any) => c.__type === "ImageURI"
      );

      let htmlContent = "";
      if (questionTextObj)
        htmlContent += `<p>${questionTextObj.questionText}</p>`;
      if (imageUriObj) htmlContent += `<img src="${imageUriObj.imageUri}" `;

      return {
        id: Date.now() + Math.random(),
        content: htmlContent,
        options: question.options.map((opt: string) => `<p>${opt}</p>`),
      };
    });

    setQuestions(newQuestions);
    questionEditor?.commands.setContent("");
    optionEditors.forEach((e) => e?.commands.setContent(""));
    setCurrentQuestionId(null);
  };

  return {
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
  };
}
