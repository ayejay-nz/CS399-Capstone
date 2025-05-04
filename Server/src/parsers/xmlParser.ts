import { XMLParser } from 'fast-xml-parser';
import { ExamData, FeedbackDefaults } from '../dataTypes/examData';

/**
 * Parses a Moodle-style quiz XML
 *
 * Relevant fields from xml:
 *  - comments like <!-- question: 3699 --> are used as IDs
 *  - <question>: question content & info is nested within
 *    - tyeps:
 *      - description
 *        - only need <questiontext> for section content and make questionCount null for now
 *      - multichoice <- skip all others that aren't listed
 *  - <questiontext>: question description. Maybe inlude images encoded in base64
 *  - <defaultgrade>: marks available for a question
 *  - <correctfeedback>
 *  - <incorrectFeedback>
 *  - <answer>: each answer represents one option in order of alphabets (e.g. a, b, c, d, e)
 *    - <answer fraction="100"> indicates the correct answer.
 *      - errors:
 *        - if first element in the options (Question interface) array isn't the correct answer
 *        - if multiple answers have fraction="100" or no answers have it
 *        - if only one answer
 *    - <text>: answer description
 *    - <feedback>: ignored
 *
 * @param xml - The XML string from a file
 * @returns ExamData
 */
export function xmlParser(xml: string): ExamData {
    // Extract question IDs from comments like <!-- question: 3699 -->
    const idMatches = [...xml.matchAll(/<!--\s*question\s*:\s*(\d+)\s*-->/g)].map((m) =>
        parseInt(m[1]!, 10),
    );

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        cdataPropName: '#cdata',
        ignoreDeclaration: true,
        parseTagValue: false,
    });

    const parsed = parser.parse(xml);
    const quiz = parsed.quiz;
    if (!quiz || !quiz.question) {
        return { content: [] };
    }

    let questions = quiz.question;
    if (!Array.isArray(questions)) {
        questions = [questions];
    }

    const output: any[] = [];

    questions.forEach((q: any, idx: number) => {
        const type = q['@_type'];

        if (type === 'multichoice') {
            // Check mandatory fields
            if (!q.questiontext) throw new Error('<questiontext> is mandatory');
            if (!q.defaultgrade) throw new Error('<defaultgrade> is mandatory');
            if (!q.correctfeedback) throw new Error('<correctfeedback> is mandatory');
            if (!q.incorrectfeedback) throw new Error('<incorrectfeedback> is mandatory');

            // Get answers
            let answers = q.answer || [];
            if (!Array.isArray(answers)) answers = [answers];
            if (answers.length < 2) throw new Error('At least two answers are required');

            const correctAnswers = answers.filter((a: any) => String(a['@_fraction']) === '100');
            if (correctAnswers.length > 1)
                throw new Error('Multiple correct answers are not allowed');
            if (correctAnswers.length === 0) throw new Error('No correct answer found');

            // Extract text content
            const extractText = (node: any) => {
                if (typeof node === 'object' && '#cdata' in node) return node['#cdata'];
                return String(node);
            };

            // Create options with correct answer first
            const correctOpts = correctAnswers.map((a: any) => extractText(a.text));
            const incorrectOpts = answers
                .filter((a: any) => String(a['@_fraction']) !== '100')
                .map((a: any) => extractText(a.text));
            const options = [...correctOpts, ...incorrectOpts];

            // Parse question content (text + any base64 image files)
            const contentArr: any[] = [];
            const qt = q.questiontext.text;
            contentArr.push({ questionText: extractText(qt) });

            const files = q.questiontext.file
                ? Array.isArray(q.questiontext.file)
                    ? q.questiontext.file
                    : [q.questiontext.file]
                : [];
            for (const f of files) {
                const base64 = f['#cdata'];
                const name = f['@_name'];
                const ext = name.split('.').pop();
                contentArr.push({ imageUri: `data:image/${ext};base64,${base64}` });
            }

            // Extract feedback
            const correctFB = extractText(q.correctfeedback.text);
            const incorrectFB = extractText(q.incorrectfeedback.text);
            const feedback = { correctFeedback: correctFB, incorrectFeedback: incorrectFB };

            // Get marks
            const marks = Number(q.defaultgrade);

            // Get ID
            const id = idMatches[idx] ?? null;

            output.push({
                question: {
                    id,
                    marks,
                    feedback,
                    content: contentArr,
                    options,
                },
            });
        } else if (type === 'description') {
            // Section headings
            if (!q.questiontext) return;
            const qt = q.questiontext.text;
            const sectionText =
                typeof qt === 'object' && '#cdata' in qt ? qt['#cdata'] : String(qt);
            output.push({
                section: {
                    questionCount: null,
                    content: [{ sectionText }],
                },
            });
        }
        // skip all other types except question type "multichoice" and "description" (section)
    });

    return { content: output };
}
