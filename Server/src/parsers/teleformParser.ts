import { StudentTeleformData, TeleformData } from "../dataTypes/teleformData";

/**
 * Parses raw teleform text data into a TeleformData object.
 *
 * Teleform Field layout:
 *  - AUID           : chars (11 chars)
 *  - Last Name      : chars
 *  - First Name     : chars
 *  - Course+Version : chars (11 chars: first 3 = course number, last 1 = version number)
 *  - Answers        : chars 2 digits per answer
 *    - 01 = A
 *    - 02 = B
 *    - 04 = C
 *    - 08 = D
 *    - 16 = E
 *
 * @param fileContent Raw text content of the Teleform txt file
 * @returns TeleformData containing studentAnswers
 */
export function parseTeleformData(fileContent: string): TeleformData {
  const lines = fileContent.split(/\r?\n/);
  const studentAnswers: StudentTeleformData[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const auid = trimmed.slice(0, 11).trim();
    const lastName = trimmed.slice(12, 22).trim();
    const firstName = trimmed.slice(22, 32).trim();
    const courseVersionField = trimmed.slice(33, 44).trim();
    const answerString = trimmed.slice(44).trim();

    if (
      !auid ||
      !lastName ||
      !firstName ||
      !courseVersionField ||
      !answerString
    ) {
      console.warn("Skipping invalid line (missing fields):", line);
      continue;
    }

    const courseNumber = courseVersionField.slice(0, 3);
    const versionNumber = courseVersionField.slice(-1);

    // parse answers two digits at a time
    const answers: number[] = [];
    for (let i = 0; i < answerString.length; i += 2) {
      const chunk = answerString.slice(i, i + 2);
      if (chunk.length !== 2) {
        console.warn("Skipping incomplete answer chunk:", chunk);
        continue;
      }
      const n = parseInt(chunk, 10);
      answers.push(isNaN(n) ? 0 : n);
    }

    studentAnswers.push({
      auid,
      lastName,
      firstName,
      courseNumber,
      versionNumber,
      answers,
    });
  }

  return { studentAnswers };
}
