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

// Strip HTML tags from text using regex
function stripHtmlTags(html: string): string {
    // First remove all HTML tags
    const withoutTags = html.replace(/<\/?[^>]+(>|$)/g, '');
    // Then trim whitespace (including newlines) from both ends
    return withoutTags.trim();
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
export async function xmlParser(xmlBuffer: string | Buffer): Promise<ExamData> {
    // convert buffer to string
    const xmlString = typeof xmlBuffer === 'string' ? xmlBuffer : xmlBuffer.toString('utf-8');

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

            // build options, with correct first - strip HTML tags
            const options: string[] = [
                stripHtmlTags(extract(correct[0].text)),
                ...answers
                    .filter((a) => String(a['@_fraction']) !== '100')
                    .map((a) => stripHtmlTags(extract(a.text))),
            ];

            // content: text + images + tables - strip HTML tags from question text
            const content: (QuestionText | ImageURI | TableURI)[] = [];
            const rawQuestionText = extract(q.questiontext.text);
            const cleanQuestionText = stripHtmlTags(rawQuestionText);

            content.push({
                questionText: cleanQuestionText,
                __type: 'QuestionText',
            } as QuestionText);

            const files = ([] as any[]).concat(q.questiontext.file || []);
            for (const f of files) {
                const name = String(f['@_name']);
                const ext = name.split('.').pop()?.toLowerCase() || '';

                // For debugging - print file object keys and structure without the actual base64 data
                const debugObj = { ...f };
                Object.keys(debugObj).forEach((key) => {
                    if (typeof debugObj[key] === 'string' && debugObj[key].length > 50) {
                        debugObj[key] = `[String of length ${debugObj[key].length}]`;
                    }
                });
                // console.log('File object keys:', Object.keys(f));
                // console.log('File object structure:', JSON.stringify(debugObj, null, 2));

                // Try different ways to access the base64 content
                let b64 = '';

                // Common patterns for accessing text content in parsed XML
                if (typeof f === 'string') {
                    b64 = f;
                } else if (f['#text']) {
                    // Moodle XML typically stores image data in #text
                    b64 = f['#text'];
                } else if (f['#cdata']) {
                    b64 = f['#cdata'];
                } else if (f['text']) {
                    b64 = f['text'];
                } else if (f['__text']) {
                    b64 = f['__text'];
                } else if (typeof f === 'object') {
                    // If it's an object but doesn't have the expected properties,
                    // try to find the longest string property which might be our base64 data
                    const stringProps = Object.entries(f)
                        .filter(([key, val]) => typeof val === 'string' && !key.startsWith('@_'))
                        .sort(([, a], [, b]) => (b as string).length - (a as string).length);

                    if (stringProps.length > 0) {
                        const keyValue = stringProps[0];
                        if (keyValue) {
                            const key = keyValue[0];
                            const value = keyValue[1];
                            // console.log(`Using property '${key}' as base64 data source`);
                            b64 = value as string;
                        }
                    }
                }

                if (!b64) {
                    // Last resort, try to convert the whole object to string
                    b64 = String(f);
                    // If that fails too, just log an error
                    if (!b64 || b64 === '[object Object]') {
                        // console.error(`Failed to extract base64 data for file ${name}`);
                        // console.error('File object:', f);
                        b64 = '';
                    }
                }

                // console.log(`Extracted base64 data for ${name} (length: ${b64.length})`);

                const uri = `data:image/${ext};base64,${b64}`;
                content.push({
                    imageUri: uri,
                    __type: 'ImageURI',
                } as ImageURI);
            }

            const feedback = {
                correctFeedback: stripHtmlTags(extract(q.correctfeedback.text)),
                incorrectFeedback: stripHtmlTags(extract(q.incorrectfeedback.text)),
            };
            const marks = Number(q.defaultgrade);
            const idMatches = [...xmlString.matchAll(/<!--\s*question\s*:\s*(\d+)\s*-->/g)].map(
                (m) => parseInt(m[1]!, 10),
            );
            const id = idMatches[idx] ?? 0;

            output.push({ question: { id, marks, feedback, content, options } });
        } else if (type === 'description' && q.questiontext) {
            const rawText = extract(q.questiontext.text);
            const cleanText = stripHtmlTags(rawText);
            output.push({
                section: {
                    questionCount: null,
                    content: [
                        {
                            sectionText: cleanText,
                            __type: 'SectionText',
                        } as SectionText,
                    ],
                },
            });
        }
    });

    return { content: output };
}
