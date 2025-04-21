"use client";
import { useState } from "react";

export function useMcq() {
  const [questionEditor, setQuestionEditor] = useState(null);
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

  const handleEdit = (q) => {
    console.log(q);
    setOptionEditors((prev) => {
      const keep = prev.slice(0, q.options.length)
      // if we need more slots, append null placeholders
      if (keep.length < q.options.length) {
        return keep.concat(Array(q.options.length - keep.length).fill(null))
      }
      return keep
    })
    questionEditor.commands.setContent(q.content);
    q.options.forEach((optContent, i) => {
      optionEditors[i].commands.setContent(optContent);
    });
    setCurrentQuestionId(q.id);
    setMarks(q.marks || 1);
  };

  // /*const simulateProcessQuestions = async (file: File) => {
  //   /*try {
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     const res = await fetch("{localhost}/api/{}", {
  //       method: "POST",
  //       body: formData,
  //     });
      
  //     if (!res.ok) {
  //       console.log("test");
  //       //throw new Error("File upload failed");
        
  //     }

  //     const data = await res.json();
  //     handleProcessedQuestions(data);
  //   } catch (err) {
  //     console.error("Error uploading and processing file:", err);
  //     alert("Failed to upload and process the file.");
  //   } */
  //   const data = ""
  // }; 
  const simulateProcessQuestions = async (file: File) => {
    try {
      // read the raw text out of the File
      const jsonText = await file.text()
      // parse it to an object/array
      const data = JSON.parse(jsonText)
  
      // hand it off to your existing handler
      handleProcessedQuestions(data)
      //console.log(data);
    } catch (err) {
      console.error("Error processing test JSON file:", err)

    }
  }

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
        optionsLength: question.options.length,
        marks: question.marks || 1,
      };
    });
    //setOptionEditors(Array(newQuestions[0].options.length).fill(null)) 
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
  };
}
