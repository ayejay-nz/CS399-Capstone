import { Workbook } from 'exceljs';
import {
    AnswerKey,
    AnswerKeyQuestion,
    QuestionSolution,
    VersionSolution,
} from '../dataTypes/answerKey';
import ParserError from '../utils/parserError';
import ApiError from '../utils/apiError';

// '1234' -> [1, 2, 3, 4]
function parseSequence(sequence: unknown): number[] {
    return String(sequence)
        .trim()
        .split('')
        .map((d) => Number(d))
        .filter((n) => !isNaN(n));
}

// 1 - > [1], '1,2,3' -> [1, 2, 3]
function parseAnswers(answers: unknown): number[] {
    if (typeof answers === 'number') return [answers];

    return String(answers)
        .split(/,+/)
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));
}

function parseSourceQuestionsFromWorkbook(wb: Workbook): AnswerKeyQuestion[] {
    const sourceSheet = wb.getWorksheet('Source');
    if (!sourceSheet) throw new ApiError(); // TODO -- SET ERROR CODES

    const header = sourceSheet?.getRow(1);
    if (!header) throw new ApiError(); // TODO -- SET ERROR CODES

    const columns: {
        questionId?: number;
        questionStem?: number;
        markWeight?: number;
        optionColumns: { idx: number }[];
    } = { optionColumns: [] };

    // Extract relevant column information
    header.eachCell((cell, idx) => {
        const cellTxt = String(cell.value ?? '')
            .trim()
            .toLowerCase();
        if (cellTxt === 'questionid') columns.questionId = idx;
        else if (cellTxt === 'questionstem') columns.questionStem = idx;
        else if (cellTxt === 'markweight') columns.markWeight = idx;
        else if (/^[0-9]$/.test(cellTxt)) columns.optionColumns.push({ idx });
    });

    const questions: AnswerKeyQuestion[] = [];

    // Extract question information
    sourceSheet.eachRow((row, idx) => {
        if (idx === 1) return;
        const questionIdCell = row.getCell(columns.questionId!).value;
        const questionStemCell = row.getCell(columns.questionStem!).value;
        const markWeightCell = row.getCell(columns.markWeight!).value;

        const options = columns.optionColumns
            .map((col) => String(row.getCell(col.idx).value ?? '').trim())
            .filter((option) => option !== '');

        questions.push({
            marks: Number(markWeightCell),
            id: Number(questionIdCell),
            feedback: {}, // Set up proper feedback later
            content: String(questionStemCell),
            options: options,
        });
    });

    return questions;
}

function getVersionsFromSheet1(wb: Workbook): string[] {
    const sheet1 = wb.getWorksheet('Sheet1');
    if (!sheet1) throw new ApiError(); // TODO -- SET ERROR CODES

    const versions: string[] = [];

    // Get version column index
    const header = sheet1.getRow(1);
    let versionColumnIdx = 1;
    header.eachCell((cell, cellIdx) => {
        const cellTxt = String(cell.value ?? '')
            .trim()
            .toLowerCase();

        if (cellTxt === 'versions') versionColumnIdx = cellIdx;
    });

    // Get version numbers
    sheet1.eachRow((row, rowIdx) => {
        if (rowIdx === 1) return; // Skip header
        const versionNumber = row.getCell(versionColumnIdx).value;
        if (versionNumber != null) versions.push(String(versionNumber).trim());
    });

    return versions;
}

export async function parseAnswerKeyXLSX(buffer: Buffer): Promise<AnswerKey> {
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer);

    const sourceQuestions = parseSourceQuestionsFromWorkbook(workbook);
    const versionNames = getVersionsFromSheet1(workbook);
    let versionSolutions: VersionSolution[] = [];

    versionNames.forEach((name) => {
        const sheet = workbook.getWorksheet(name);
        if (!sheet) throw new ApiError(); // TODO -- SET UP ERROR CODES

        const header = sheet.getRow(1);

        const columns: {
            questionId?: number;
            answer?: number;
            markWeight?: number;
            optionSequences?: number;
        } = {};

        // Extract relevant column indexes
        header.eachCell((cell, idx) => {
            const cellTxt = String(cell.value ?? '')
                .trim()
                .toLowerCase();
            if (cellTxt === 'questionid') columns.questionId = idx;
            else if (cellTxt === 'answer') columns.answer = idx;
            else if (cellTxt === 'markweight') columns.markWeight = idx;
            else if (cellTxt === 'optionsequences') columns.optionSequences = idx;
        });

        const questionSolutions: QuestionSolution[] = [];
        sheet.eachRow((row, idx) => {
            if (idx === 1) return;

            const questionIdCell = row.getCell(columns.questionId!).value;
            const answerCell = row.getCell(columns.answer!).value;
            const markWeightCell = row.getCell(columns.markWeight!).value;
            const optionSequenceCell = row.getCell(columns.optionSequences!).value;

            questionSolutions.push({
                questionId: Number(questionIdCell),
                answers: parseAnswers(answerCell),
                mark: Number(markWeightCell),
                optionSequence: parseSequence(optionSequenceCell),
            });
        });

        versionSolutions.push({
            versionNumber: name,
            questionSolutions: questionSolutions,
        });
    });

    const answerKey = {
        source: sourceQuestions,
        versionSolutions: versionSolutions,
    };

    return answerKey;
}
