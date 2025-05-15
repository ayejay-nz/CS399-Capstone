import { API_ERROR_CODE } from '../constants/constants';
import { StudentTeleformData, TeleformData } from '../dataTypes/teleformData';
import ParserError from '../utils/parserError';

/**
 * Parses raw teleform data into a TeleformData object.
 *
 * @param data Raw content of the Teleform txt file (either Buffer or string)
 * @returns TeleformData containing studentAnswers
 */
export function teleformParser(data: Buffer | string): TeleformData {
    // Convert Buffer to string if necessary
    const rawText = Buffer.isBuffer(data) ? data.toString('utf-8') : data;
    const studentAnswers: StudentTeleformData[] = [];

    for (const line of rawText.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const [auid = '', lastName = '', firstName = '', courseAndVersion = '', answerString = ''] =
            trimmed.split(/\s+/);

        if (!lastName || !firstName || !courseAndVersion || answerString.length === 0) {
            throw new ParserError(
                API_ERROR_CODE.TELEFORM_PARSE_FAILED,
                'Invalid lines: missing fields',
            );
        }

        const courseNumber = courseAndVersion.slice(0, 3);
        const versionNumber = courseAndVersion.slice(-1);

        const answers: number[] = [];
        for (let i = 0; i + 1 < answerString.length; i += 2) {
            answers.push(parseInt(answerString.slice(i, i + 2), 10));
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
