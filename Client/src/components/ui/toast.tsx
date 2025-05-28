import { Toaster } from "sonner";

export function Toast() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      expand={false}
      duration={4000}
      theme="dark"
      className="font-sans"
    />
  );
}
