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

        const auid = trimmed.slice(0, 11).trim();
        const lastName = trimmed.slice(12, 25).trim() || undefined;
        const firstName = trimmed.slice(25, 32).trim() || undefined;
        const middleInitial = trimmed.slice(32, 33).trim() || undefined;
        const courseAndVersion = trimmed.slice(33, 44).trim() || undefined;
        const answerString = trimmed.slice(45).trim();

        if (!lastName || !firstName || !courseAndVersion) {
            throw new ParserError(
                API_ERROR_CODE.TELEFORM_PARSE_FAILED,
                'Invalid lines: missing fields',
            );
        }

        const courseNumber = courseAndVersion.slice(0, 3);
        const versionNumber = courseAndVersion.slice(-1).padStart(8, '0');

        const answers: (number | null)[] = [];
        for (let i = 0; i + 1 < answerString.length; i += 2) {
            answers.push(parseInt(answerString.slice(i, i + 2), 10) || null);
        }

        studentAnswers.push({
            auid,
            lastName,
            middleInitial,
            firstName,
            courseNumber,
            versionNumber,
            answers,
        });
    }

    return { studentAnswers };
}
