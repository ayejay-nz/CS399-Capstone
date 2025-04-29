import { parseTeleformData } from "../../src/parsers/teleformParser";
import {
  StudentTeleformData,
  TeleformData,
} from "../../src/dataTypes/teleformData";

describe("parseTeleformData()", () => {
  it("returns a TeleformData with one student for a single valid line", () => {
    const raw = `01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604`;
    const result: TeleformData = parseTeleformData(raw);

    expect(result).toHaveProperty("studentAnswers");
    expect(result.studentAnswers).toHaveLength(1);

    const expected: StudentTeleformData = {
      auid: "01123456712",
      lastName: "NGWERUME",
      firstName: "MUGOVEV",
      courseNumber: "111",
      versionNumber: "2",
      answers: [4, 8, 2, 2, 4, 1, 1, 16, 16, 4],
    };

    expect(result.studentAnswers[0]).toEqual(expected);
  });

  it("skips empty lines", () => {
    const raw = `

01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604

`;
    const { studentAnswers } = parseTeleformData(raw);
    expect(studentAnswers).toHaveLength(1);
  });

  it("skips lines missing required fixed-width fields", () => {
    const raw = `12345678901 BADDATA                0408020204`;
    const { studentAnswers } = parseTeleformData(raw);
    expect(studentAnswers).toHaveLength(0);
  });

  it("parses multiple lines into multiple StudentTeleformData entries", () => {
    const raw = [
      `01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604`,
      `01122344411 DDMELLO      MERVIN  11100000002 04081616160101011608`,
      `01105020212 STEHLIN      BRENT   11100000003 04010104021604010802`,
    ].join("\n");

    const { studentAnswers } = parseTeleformData(raw);
    expect(studentAnswers).toHaveLength(3);
    expect(studentAnswers.map((s) => s.firstName)).toEqual([
      "MUGOVEV",
      "MERVIN",
      "BRENT",
    ]);
  });

  it("defaults non-numeric answer chunks to 0", () => {
    const raw = `01123456712 NGWERUME     MUGOVEV 11100000002 04XX0202040101161604`;
    const { studentAnswers } = parseTeleformData(raw);
    const answers = studentAnswers[0].answers;
    expect(answers).toContain(0);
    // ensure other valid chunks still parse
    expect(answers).toEqual(
      expect.arrayContaining([4, 2, 2, 4, 1, 1, 16, 16, 4]),
    );
  });

  it("skips an incomplete final answer chunk", () => {
    // remove last digit so final chunk is length 1
    const raw = `01123456712 NGWERUME     MUGOVEV 11100000002 0408020204010116160`;
    const { studentAnswers } = parseTeleformData(raw);
    // full valid chunk count would be 10 pairs; with one leftover digit => 9 pairs
    expect(studentAnswers[0].answers).toHaveLength(9);
  });
});
