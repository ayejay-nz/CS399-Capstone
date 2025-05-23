import { teleformParser } from '../../src/parsers/teleformParser';
import { StudentTeleformData, TeleformData } from '../../src/dataTypes/teleformData';
import ParserError from '../../src/utils/parserError';

describe('parseTeleformData()', () => {
    it('returns a TeleformData with one student for a single valid line', () => {
        const raw = `01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604`;
        const result: TeleformData = teleformParser(raw);

        expect(result).toHaveProperty('studentAnswers');
        expect(result.studentAnswers).toHaveLength(1);

        const expected: StudentTeleformData = {
            auid: '01123456712',
            lastName: 'NGWERUME',
            firstName: 'MUGOVEV',
            courseNumber: '111',
            versionNumber: '00000002',
            answers: [4, 8, 2, 2, 4, 1, 1, 16, 16, 4],
        };

        expect(result.studentAnswers[0]).toEqual(expected);
    });

    it('handles Buffer input correctly', () => {
        const rawString = `01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604`;
        const rawBuffer = Buffer.from(rawString, 'utf-8');
        const result: TeleformData = teleformParser(rawBuffer);

        expect(result).toHaveProperty('studentAnswers');
        expect(result.studentAnswers).toHaveLength(1);

        const expected: StudentTeleformData = {
            auid: '01123456712',
            lastName: 'NGWERUME',
            firstName: 'MUGOVEV',
            courseNumber: '111',
            versionNumber: '00000002',
            answers: [4, 8, 2, 2, 4, 1, 1, 16, 16, 4],
        };

        expect(result.studentAnswers[0]).toEqual(expected);
    });

    it('skips empty lines', () => {
        const raw = `

01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604

`;
        const { studentAnswers } = teleformParser(raw);
        expect(studentAnswers).toHaveLength(1);
    });

    it('parses multiple students in the same input', () => {
        const raw = [
            `01123456712 NGWERUME     MUGOVEV 11100000002 04080202040101161604`,
            `01122344411 DDMELLO      MERVIN  11100000002 04081616160101011608`,
        ].join('\n');

        const result = teleformParser(raw);
        expect(result.studentAnswers).toHaveLength(2);
        expect(result.studentAnswers[1]).toMatchObject({
            auid: '01122344411',
            lastName: 'DDMELLO',
            firstName: 'MERVIN',
            courseNumber: '111',
            versionNumber: '00000002',
        });
        expect(result.studentAnswers[1]!.answers).toEqual(
            [4, 8, 16, 16, 16, 1, 1, 1, 16, 8].slice(
                0,
                Math.floor('04081616160101011608'.length / 2),
            ),
        );
    });

    it('throws if a line is missing mandatory fields', () => {
        // missing answers part
        const raw = `01123456712              MUGOVEV 11100000002 04080202040101161604`;
        expect(() => teleformParser(raw)).toThrow(ParserError);
        expect(() => teleformParser(raw)).toThrow('Invalid lines: missing fields');
    });

    // it("throws if a line has odd-length answer field", () => {
    //   // odd-length answer string → last digit dropped
    //   const raw = `01123456712 NGWERUME     MUGOVEV 11100000002 0408020204010116160`;
    //   expect(() => parseTeleformData(raw)).toThrow(
    //     "Invalid lines: odd-length answer field",
    //   );
    // });
});
