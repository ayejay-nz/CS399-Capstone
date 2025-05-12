// xmlParser.ts
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
 *       – `answer` options (exactly one with fraction="100" and between three to five total)
 *
 * Validation errors thrown:
 *   • Missing mandatory elements (<questiontext>, <defaultgrade>,
 *     <correctfeedback>, <incorrectfeedback>)
 *   • Fewer than three or more than five <answer> elements
 *   • Zero or multiple correct answers (fraction="100")
 *   • XML syntax errors
 *
 * IDs are extracted from comments of the form <!-- question: 1234 -->.
 *
 * @param xmlBuffer  Raw quiz XML buffer
 * @returns         Parsed `ExamData` object with `Question` and `Section` entries
 */
export function xmlParser(xmlBuffer: string | Buffer): ExamData {
    // convert buffer to string
    const xmlString = xmlBuffer.toString('utf-8');

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        cdataPropName: '#cdata',
        ignoreDeclaration: true,
        parseTagValue: false,
    });

    let parsed: any;
    try {
        parsed = parser.parse(xmlString);
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
                    throw new ParserError(API_ERROR_CODE.PARSING_FAILED, msg);
                }
            }

            // answers must total between 3 and 5
            const answers = ([] as any[]).concat(q.answer || []);
            if (answers.length < 3 || answers.length > 5) {
                throw new ParserError(
                    API_ERROR_CODE.PARSING_FAILED,
                    'Number of answers must be between 3 and 5',
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

            // build options, with correct first
            const options: string[] = [
                extract(correct[0].text),
                ...answers
                    .filter((a) => String(a['@_fraction']) !== '100')
                    .map((a) => extract(a.text)),
            ];

            // content: text + images + tables
            const content: (QuestionText | ImageURI | TableURI)[] = [];
            content.push({ questionText: extract(q.questiontext.text) } as QuestionText);

            const files = ([] as any[]).concat(q.questiontext.file || []);
            for (const f of files) {
                const name = String(f['@_name']);
                const ext = name.split('.').pop()?.toLowerCase() || '';
                const b64 = f['#cdata'];
                const uri = `data:image/${ext};base64,${b64}`;
                content.push({ imageUri: uri } as ImageURI);
            }

            const feedback = {
                correctFeedback: extract(q.correctfeedback.text),
                incorrectFeedback: extract(q.incorrectfeedback.text),
            };
            const marks = Number(q.defaultgrade);
            const idMatches = [...xmlString.matchAll(/<!--\s*question\s*:\s*(\d+)\s*-->/g)].map(
                (m) => parseInt(m[1]!, 10),
            );
            const id = idMatches[idx] ?? 0;

            output.push({ question: { id, marks, feedback, content, options } });
        } else if (type === 'description' && q.questiontext) {
            const text = extract(q.questiontext.text);
            output.push({
                section: { questionCount: null, content: [{ sectionText: text } as SectionText] },
            });
        }
    });

    return { content: output };
}
