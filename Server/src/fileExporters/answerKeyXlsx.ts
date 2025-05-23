import { Workbook, Worksheet } from 'exceljs';
import {
    AnswerKey,
    VersionSolution,
    QuestionSolution,
    AnswerKeyQuestion,
    Metadata,
} from '../dataTypes/answerKey';

function answersToString(answers: number[]): string {
    return answers.join(',');
}

function optionsToString(options: number[]): string {
    return options.join('');
}

function renderSourceSheet(wb: Workbook, source: AnswerKeyQuestion[]): Worksheet {
    const sourceSheet = wb.addWorksheet('Source');

    const optionColumns = Array.from({ length: 10 }, (_, i) => ({
        header: String(i),
        key: `opt${i}`,
    }));

    sourceSheet.columns = [
        { header: 'QuestionID', key: 'id' },
        { header: 'QuestionStem', key: 'content' },
        { header: 'MarkWeight', key: 'marks' },
        ...optionColumns,
    ];

    source.forEach((q) => {
        const row: Record<string, unknown> = {
            id: q.id,
            content: q.content,
            marks: q.marks,
        };

        // Fill out option columns
        q.options.forEach((option, idx) => (row[`opt${idx}`] = option));

        sourceSheet.addRow(row);
    });

    return sourceSheet;
}

function renderVersionSheets(wb: Workbook, versionSolutions: VersionSolution[]): Worksheet[] {
    const versionSheets: Worksheet[] = [];

    versionSolutions.map((v) => {
        const versionSheet = wb.addWorksheet(v.versionNumber);

        versionSheet.columns = [
            { header: 'QuestionID', key: 'id' },
            { header: 'Answer', key: 'answer' },
            { header: 'MarkWeight', key: 'mark' },
            { header: 'OptionSequences', key: 'optionSequence' },
        ];

        v.questionSolutions.forEach((q) => {
            versionSheet.addRow({
                id: q.questionId,
                answer: answersToString(q.answers),
                mark: q.mark,
                optionSequence: optionsToString(q.optionSequence),
            });
        });

        versionSheets.push(versionSheet);
    });

    return versionSheets;
}

function renderSheet1(wb: Workbook, versions: VersionSolution[]): Worksheet {
    const sheet1 = wb.addWorksheet('Sheet1');
    sheet1.columns = [{ header: 'Versions', key: 'v' }];

    [...versions]
        .sort((a, b) => Number(a.versionNumber) - Number(b.versionNumber))
        .forEach((v) => sheet1.addRow({ v: v.versionNumber }));

    return sheet1;
}

function renderMetadata(wb: Workbook, meta: Metadata): Worksheet {
    // Add hidden sheet for tracking metadata
    const metadataSheet = wb.addWorksheet('__meta__');
    metadataSheet.state = 'veryHidden';

    // Add metadata to sheet
    const metadata: Record<string, string> = { ...meta };
    metadataSheet.addRow(['Key', 'Value']);
    for (const [k, v] of Object.entries(metadata)) {
        metadataSheet.addRow([k, String(v)]);
    }

    return metadataSheet;
}

export async function exportAnswerKeyXlsx(answerKey: AnswerKey): Promise<Buffer> {
    const workbook = new Workbook();

    renderSourceSheet(workbook, answerKey.source);
    renderVersionSheets(workbook, answerKey.versionSolutions);
    renderSheet1(workbook, answerKey.versionSolutions);
    renderMetadata(workbook, answerKey.metadata);

    const buffer: any = workbook.xlsx.writeBuffer(); // Bug with exceljs -- have to declare as type any

    return buffer;
}
