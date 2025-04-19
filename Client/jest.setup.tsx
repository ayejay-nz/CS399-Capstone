import "@testing-library/jest-dom";

// ── Next.js stubs so tests don't choke on <Link> / <Image> ──
jest.mock("next/link", () => ({ children, href }: any) => (
  <a href={href}>{children}</a>
));
jest.mock("next/image", () => (props: any) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img {...props} alt={props.alt} />
));
