import { XMLParser } from "fast-xml-parser";
import { ExamData } from "../dataTypes/examData";

/**
 * Parses a Moodle-style quiz XML
 *
 * Relevant fields from xml:
 *  - <question>: question content & info is nested within
 *  - <category>: type of question
 *    - calculated
 *    - calculatedmulti
 *    - description
 *    - multichoice <- the one we need skip all others
 *  - <questiontext>: question description. Maybe inlude images encoded in base64
 *  - <defaultgrade>: marks available for a question
 *  - <correctfeedback>
 *  - <incorrectFeedback>
 *  - <answer>: each answer represents one option in order of alphabets (e.g. a, b, c, d, e)
 *    - <answer fraction="100"> indicates the correct answer. Make sure in the output examData object correct answer is the first element in the options array
 *      - need error handling in case multiple answers have fraction="100" or no answer have it
 *    - <text>: answer description
 *    - <feedback>: ignored
 *
 * @param xml - The XML string from a file
 * @returns ExamData
 */
export function xmlParser(xml: string): ExamData {
  const result: ExamData = { content: [] };
  return result;
}
