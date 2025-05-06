import { XMLParser } from 'fast-xml-parser';
import { API_ERROR_CODE } from '../constants/constants';
import {
    ExamData,
    ImageURI,
    Question,
    QuestionText,
    Section,
    SectionText,
    TableURI,
} from '../dataTypes/examData';
import ParserError from '../utils/parserError';

// extract CDATA or text
function extract(node: any): string {
    if (typeof node === 'object' && '#cdata' in node) {
        return node['#cdata'];
    }
    return String(node);
}

// mandatory fields for multichoice
const MANDATORY_FIELDS: Array<[keyof any, string]> = [
    ['questiontext', '<questiontext> is mandatory'],
    ['defaultgrade', '<defaultgrade> is mandatory'],
    ['correctfeedback', '<correctfeedback> is mandatory'],
    ['incorrectfeedback', '<incorrectfeedback> is mandatory'],
];

/**
 * Parse a Moodle-style quiz XML into structured exam data.
 *
 * Supported question types:
 *   • description — treated as a section; only <questiontext> is used,
 *     and `questionCount` is set to null.
 *   • multichoice — converted to a Question with:
 *       – `questiontext` (HTML or CDATA) and any embedded base64 images
 *       – `defaultgrade` as the marks
 *       – `correctfeedback` and `incorrectfeedback` text
 *       – `answer` options (exactly one with fraction="100" and at least two total)
 *
 * Validation errors thrown:
 *   • Missing mandatory elements (<questiontext>, <defaultgrade>,
 *     <correctfeedback>, <incorrectfeedback>)
 *   • Less than two <answer> elements
 *   • Zero or multiple correct answers (fraction="100")
 *   • XML syntax errors
 *
 * IDs are extracted from comments of the form <!-- question: 1234 -->.
 *
 * @param xml  Raw quiz XML string
 * @returns     Parsed `ExamData` object with `Question` and `Section` entries
 */
export function xmlParser(xml: string): ExamData {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        cdataPropName: '#cdata',
        ignoreDeclaration: true,
        parseTagValue: false,
    });

    let parsed: any;
    try {
        parsed = parser.parse(xml);
    } catch (e: any) {
        throw new ParserError(API_ERROR_CODE.XML_PARSE_FAILED, `Invalid XML syntax: ${e.message}`);
    }

    const questionsRaw = ([] as any[]).concat(parsed.quiz?.question || []);

    const output: Array<Question | Section> = [];

    questionsRaw.forEach((q: any, idx: number) => {
        const type = q['@_type'];

        if (type === 'multichoice') {
            // check mandatory fields
            for (const [key, msg] of MANDATORY_FIELDS) {
                if (!(key in q)) {
                    throw new ParserError(API_ERROR_CODE.XML_PARSE_FAILED, msg);
                }
            }

            // answers
            const answers = ([] as any[]).concat(q.answer || []);
            if (answers.length < 2) {
                throw new ParserError(
                    API_ERROR_CODE.PARSING_FAILED,
                    'At least two answers are required',
                );
            }
            const correct = answers.filter((a) => String(a['@_fraction']) === '100');
            if (correct.length !== 1) {
                const reason =
                    correct.length === 0
                        ? 'No correct answer found'
                        : 'Multiple correct answers are not allowed';
                throw new ParserError(API_ERROR_CODE.PARSING_FAILED, reason);
            }
            const options: string[] = [
                ...correct.map((a) => extract(a.text)),
                ...answers
                    .filter((a) => String(a['@_fraction']) !== '100')
                    .map((a) => extract(a.text)),
            ];

            // content
            const content: (QuestionText | ImageURI | TableURI)[] = [];
            // question text block
            content.push({ questionText: extract(q.questiontext.text) } as QuestionText);
            // images
            const files = ([] as any[]).concat(q.questiontext.file || []);
            for (const f of files) {
                const ext = String(f['@_name']).split('.').pop();
                content.push({ imageUri: `data:image/${ext};base64,${f['#cdata']}` } as ImageURI);
            }

            const feedback = {
                correctFeedback: extract(q.correctfeedback.text),
                incorrectFeedback: extract(q.incorrectfeedback.text),
            };
            const marks = Number(q.defaultgrade);
            const idMatches = [...xml.matchAll(/<!--\s*question\s*:\s*(\d+)\s*-->/g)].map((m) =>
                parseInt(m[1]!, 10),
            );
            const id = idMatches[idx] ?? 0;

            output.push({
                question: { id, marks, feedback, content, options },
            });
        } else if (type === 'description' && q.questiontext) {
            const text = extract(q.questiontext.text);
            const sectionContent: SectionText[] = [{ sectionText: text } as SectionText];
            output.push({
                section: { questionCount: null, content: sectionContent },
            });
        }
    });

    return { content: output };
}
