import { renderHook, act } from "@testing-library/react";
import { useMcq } from "@/src/features/mcq/useMcq";
import { fakeEditor } from "../__utils__/fakeEditor";

describe("useMcq", () => {
  it("adds a new question when currentId is null", () => {
    const { result } = renderHook(() => useMcq());

 
    act(() => {
      result.current.setQuestionEditor(fakeEditor("<p>What?</p>"));
      result.current.setOptionEditors([
        fakeEditor("<p>A</p>"),
        fakeEditor("<p>B</p>"),
        fakeEditor("<p>C</p>"),
        fakeEditor("<p>D</p>"),
        fakeEditor("<p>E</p>"),
      ]);
    });

 
    act(() => result.current.handleAddOrUpdateQuestion());

    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].content).toMatch("What?");
  });

  it("updates an existing question when currentId is set", () => {
    const { result } = renderHook(() => useMcq());

 
    act(() => {
      result.current.setQuestionEditor(fakeEditor("<p>Old</p>"));
      result.current.setOptionEditors(Array(5).fill(fakeEditor("<p>a</p>")));
    });
    act(() => result.current.handleAddOrUpdateQuestion());

    const original = result.current.questions[0];

 
    act(() => result.current.handleEdit(original));


    act(() => {
      result.current.setQuestionEditor(fakeEditor("<p>New!</p>"));
    });
    act(() => result.current.handleAddOrUpdateQuestion());

    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].id).toBe(original.id);
    expect(result.current.questions[0].content).toMatch("New!");
  });

  it("clears all questions & resets editors", () => {
    const { result } = renderHook(() => useMcq());

 
    act(() => {
      result.current.setQuestionEditor(fakeEditor("<p>Q</p>"));
      result.current.setOptionEditors(Array(5).fill(fakeEditor("<p>a</p>")));
    });
    act(() => result.current.handleAddOrUpdateQuestion());

  
    act(() => {
      result.current.setQuestions([]);
      result.current.setCurrentQuestionId(null);
      result.current.questionEditor!.commands.setContent("");
      result.current.optionEditors.forEach((e: any) =>
        e?.commands.setContent("")
      );
    });

    expect(result.current.questions).toHaveLength(0);
    expect(result.current.currentQuestionId).toBeNull();
  });
});
