import "@testing-library/jest-dom";


jest.mock("next/link", () => ({ children, href }: any) => (
  <a href={href}>{children}</a>
));
jest.mock("next/image", () => (props: any) => (
 
  <img {...props} alt={props.alt} />
));
