import { StudentTeleformData } from "../dataTypes/teleformData";

// Parses raw teleform text data into an array of StudentTeleformData.

export function parseTeleformData(rawText: string): StudentTeleformData[] {
  const lines = rawText.split(/\r?\n/);
  const students: StudentTeleformData[] = [];

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

    students.push({
      auid,
      lastName,
      firstName,
      courseNumber,
      versionNumber,
      answers,
    });
  }

  return students;
}
