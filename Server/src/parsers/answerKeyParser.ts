import { Column, Workbook, Worksheet } from 'exceljs';
import { AnswerKey, VersionSolution } from '../dataTypes/answerKey';

// '1234' -> [1, 2, 3, 4]
function parseSequence(sequence: unknown): number[] {
    return String(sequence)
        .trim()
        .split('')
        .map((d) => Number(d));
}

function parseAnswers(answers: unknown): number[] {
    if (typeof answers === 'number') return [answers];

    return String(answers)
        .split(/,+/)
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));
}

async function parseSourceQuestions(source: Worksheet) {
    try {
        const questionIdCol = source.getColumn(1);
        const questionStemCol = source.getColumn(2);
        const markWeightCol = source.getColumn(3);
        let optionCols: Column[] = [];
        // Get the 10 option columns
        for (let optionIdx = 1; optionIdx <= 10; optionIdx++) {
            optionCols.push(source.getColumn(3 + optionIdx));
        }
        
        const questionCount = questionIdCol.values
    } catch (err) {}
}

export async function parseAnswerKeyXLSX(buffer: Buffer): Promise<AnswerKey> {
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer);

    const versionSolutions: VersionSolution[] = [];

    for (const sheet of workbook.worksheets) {
        if (sheet.name === 'Source') {
        }
    }
}
