import { render, screen, fireEvent } from "@testing-library/react";
import Toolbar from "@/src/components/mcq/Toolbar";

test("Toolbar switches mode and uploads", () => {
  const setMode = jest.fn();
  const onUpload = jest.fn();

  render(<Toolbar mode="form" setMode={setMode} onUpload={onUpload} />);

  fireEvent.click(screen.getByRole("button", { name: /text editor/i }));
  expect(setMode).toHaveBeenCalledWith("text");

  fireEvent.click(screen.getByRole("button", { name: /upload file/i }));
  expect(onUpload).toHaveBeenCalledTimes(1);
});
