export function fakeEditor(html: string) {
    return {
      getHTML: () => html,
      commands: { setContent: () => void 0 },
    };
  }
  