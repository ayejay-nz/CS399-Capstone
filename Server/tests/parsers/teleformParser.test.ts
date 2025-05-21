import { teleformParser } from '../../src/parsers/teleformParser';
import { StudentTeleformData, TeleformData } from '../../src/dataTypes/teleformData';
import ParserError from '../../src/utils/parserError';

describe('parseTeleformData()', () => {
    it('returns a TeleformData with one student for a single valid line', async () => {
        const raw = `01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604`;
        const result: TeleformData = await teleformParser(raw);

        expect(result).toHaveProperty('studentAnswers');
        expect(result.studentAnswers).toHaveLength(1);

        const expected: StudentTeleformData = {
            auid: '01123456712',
            lastName: 'NGWERUME',
            firstName: 'MUGOVEV',
            courseNumber: '111',
            versionNumber: '2',
            answers: [4, 8, 2, 2, 4, 1, 1, 16, 16, 4],
        };

        expect(result.studentAnswers[0]).toEqual(expected);
    });

    it('handles Buffer input correctly', async () => {
        const rawString = `01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604`;
        const rawBuffer = Buffer.from(rawString, 'utf-8');
        const result: TeleformData = await teleformParser(rawBuffer);

        expect(result).toHaveProperty('studentAnswers');
        expect(result.studentAnswers).toHaveLength(1);

        const expected: StudentTeleformData = {
            auid: '01123456712',
            lastName: 'NGWERUME',
            firstName: 'MUGOVEV',
            courseNumber: '111',
            versionNumber: '2',
            answers: [4, 8, 2, 2, 4, 1, 1, 16, 16, 4],
        };

        expect(result.studentAnswers[0]).toEqual(expected);
    });

    it('skips empty lines', async () => {
        const raw = `

01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604

`;
        const { studentAnswers } = await teleformParser(raw);
        expect(studentAnswers).toHaveLength(1);
    });

    it('parses multiple students in the same input', async () => {
        const raw = [
            `01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604`,
            `01122344411 DDMELLO      MERVIN  11100000002 04081616160101011608`,
        ].join('\n');

        const result = await teleformParser(raw);
        expect(result.studentAnswers).toHaveLength(2);
        expect(result.studentAnswers[1]).toMatchObject({
            auid: '01122344411',
            lastName: 'DDMELLO',
            firstName: 'MERVIN',
            courseNumber: '111',
            versionNumber: '2',
        });
        expect(result.studentAnswers[1]!.answers).toEqual(
            [4, 8, 16, 16, 16, 1, 1, 1, 16, 8].slice(
                0,
                Math.floor('04081616160101011608'.length / 2),
            ),
        );
    });

    it('throws if a line is missing mandatory fields', async () => {
        // missing answers part
        const raw = `01123456712 NGWERUME MUGOVEV 11100000002`;
        await expect(teleformParser(raw)).rejects.toThrow(ParserError);
        await expect(teleformParser(raw)).rejects.toThrow('Invalid lines: missing fields');
    });

    // it("throws if a line has odd-length answer field", () => {
    //   // odd-length answer string → last digit dropped
    //   const raw = `01123456712 NGWERUME     MUGOVEV 11100000002 0408020204010116160`;
    //   expect(() => parseTeleformData(raw)).toThrow(
    //     "Invalid lines: odd-length answer field",
    //   );
    // });
});
