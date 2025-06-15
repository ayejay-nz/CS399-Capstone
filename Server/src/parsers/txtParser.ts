import ApiError from "../utils/apiError";
import {
  HTTP_STATUS_CODE,
  API_ERROR_MESSAGE,
  API_ERROR_CODE,
} from "../constants/constants";
import {
  ExamData,
  FeedbackDefaults,
  QuestionText,
  Question,
} from "../dataTypes/examData";

export async function parseTxtFile(file: Buffer): Promise<ExamData> {
  try {
    const text = file.toString("utf-8").trim();

    const blockRx =
      /(?:(\[(\d+)[ \t]*marks?\][^\r\n]*)(?:\r?\n){2,}((?:[\S\s]+?(?=\r?\n|$))+?(?=(?:\r?\n){2,}\[\d+[ \t]*marks?\][^\r\n]*|(?:\r?\n)*$)))|(?:(\[(\d+)[ \t]*marks?\][^\r\n]*)\r?\n((?:[\S\s]+?(?=\r?\n|$))+?(?=(?:\r?\n){2,}|(?:\r?\n)*$)))/gi;
    const examContent: ExamData["content"] = [];
    let qId = 1;

    for (const m of text.matchAll(blockRx)) {
      const headerLine = m[1] ?? m[4];
      const marksStr = m[2] ?? m[5];
      const bodyBlock = m[3] ?? m[6];

      if (!headerLine || !marksStr || !bodyBlock) continue;

      const questionText = headerLine
        .replace(/^\[\d+\s*marks?\]\s*/i, "")
        .trim();

      const marks = parseInt(marksStr, 10);

      let options = bodyBlock
        .trim()
        .split(/\r?\n\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => p.replace(/\r?\n/g, "\n"));

      if (options.length === 1 && bodyBlock.includes("\n")) {
        options = bodyBlock
          .trim()
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
      }

      examContent.push({
        question: {
          id: qId++,
          marks,
          feedback: FeedbackDefaults,
          content: [
            {
              __type: "QuestionText",
              questionText: questionText,
            } as QuestionText,
          ],
          options,
        },
      });
    }

    return { content: examContent };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      HTTP_STATUS_CODE.SERVER_ERROR,
      API_ERROR_MESSAGE.serverError,
      API_ERROR_CODE.SERVER_ERROR,
      { message: err instanceof Error ? err.message : String(err) },
      true
    );
  }
}
