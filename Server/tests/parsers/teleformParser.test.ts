import { parseTeleformData } from "../../src/parsers/teleformParser";
import { StudentTeleformData } from "../../src/dataTypes/teleformData";

describe("parseTeleformData()", () => {
  it("should parse a valid teleform line into StudentTeleformData", () => {
    const input = `01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604`;

    const result = parseTeleformData(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual<StudentTeleformData>({
      auid: "01123456712",
      lastName: "NGWERUME",
      firstName: "MUGOVEV",
      courseNumber: "111",
      versionNumber: "2",
      answers: [4, 8, 2, 2, 4, 1, 1, 16, 16, 4],
    });
  });

  it("should skip empty lines", () => {
    const input = `\n\n01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604\n`;
    const result = parseTeleformData(input);
    expect(result).toHaveLength(1);
  });

  it("should skip lines with missing fields", () => {
    const input = `12345678901 BADDATA                0408020204`;
    const result = parseTeleformData(input);
    expect(result).toHaveLength(0);
  });

  it("should parse multiple lines correctly", () => {
    const input = `
01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604
01122344411 DDMELLO      MERVIN  11100000002 04081616160101011608
01105020212 STEHLIN      BRENT   11100000003 04010104021604010802
    `.trim();

    const result = parseTeleformData(input);
    expect(result).toHaveLength(3);
    expect(result.map((s) => s.firstName)).toEqual([
      "MUGOVEV",
      "MERVIN",
      "BRENT",
    ]);
  });

  it("should default non-numeric answers to 0", () => {
    const input = `01123456712 NGWERUME     MUGOVEV 11100000002 04XX0202040101161604`;
    const result = parseTeleformData(input);
    expect(result[0].answers).toContain(0); // 'XX' → 0
  });

  it("should skip incomplete answer chunks", () => {
    const input = `01123456712 NGWERUME     MUGOVEV 11100000002 0408020204010116160`; // 1 digit missing
    const result = parseTeleformData(input);
    expect(result[0].answers.length).toBe(9); // last chunk skipped
  });
});
