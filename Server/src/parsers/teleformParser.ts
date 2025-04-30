import { StudentTeleformData, TeleformData } from "../dataTypes/teleformData";

/**
 * Parses raw teleform text data into a TeleformData object.
 *
 * @param fileContent Raw text content of the Teleform txt file
 * @returns TeleformData containing studentAnswers
 */
export function parseTeleformData(rawText: string): TeleformData {
  const lines = rawText.split(/\r?\n/);
  const studentAnswers: StudentTeleformData[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue; // skip blank lines

    const auid = trimmed.slice(0, 11).trim();
    const rest = trimmed.slice(11).trim();
    const parts = rest.split(/\s+/);
    const [lastName, firstName, courseNumAndVersion, ...answerParts] = parts;

    if (
      !lastName ||
      !firstName ||
      !courseNumAndVersion ||
      answerParts.length === 0
    ) {
      throw "Invalid lines: missing fields";
    }

    // extract courseNumber & versionNumber (first 3 and last 1 digit)
    const courseNumber = courseNumAndVersion.slice(0, 3);
    const versionNumber = courseNumAndVersion.slice(-1);

    // parse two-digit chunks into numbers
    const answerString = answerParts.join("");
    const answers: number[] = [];
    for (let i = 0; i + 1 < answerString.length; i += 2) {
      const chunk = answerString.slice(i, i + 2);
      const code = parseInt(chunk, 10);
      answers.push(code);
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
