import { Toaster } from "sonner";

export function Toast() {
  return (
    <Toaster
      position="bottom-left"
      richColors
      closeButton
      expand={false}
      duration={4000}
      theme="dark"
      className="font-sans"
    />
  );
}
