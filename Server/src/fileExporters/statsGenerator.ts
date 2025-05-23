import { Workbook } from 'exceljs';
import { ExamBreakdown, StudentBreakdown } from '../dataTypes/examBreakdown';
import { only } from 'node:test';
import { percentageToDecimal2dp } from '../utils/format';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';

/**
 * Generates a statistics report in TXT format based on an exam breakdown
 *
 * @param examBreakdown The breakdown of exam results including student and question statistics
 * @returns A buffer containing the statistics report in TXT format
 */
export function generateStatsTxt(examBreakdown: ExamBreakdown): Buffer {
    const { students, questions } = examBreakdown;

    if (students.length === 0 || questions.length === 0) {
        return Buffer.from('No student data available.');
    }

    // Get course number from first student (if available)
    const courseNumber = students[0]?.versionNumber?.substring(0, 3) || 'Unknown';
    const studentCount = students.length;

    // Generate the report text
    let reportText = `Course: ${courseNumber}\nStudents Count: ${studentCount}\n\n`;

    // Process each question
    questions.forEach((question) => {
        const questionNumber = question.questionId;

        // Get question details from the first student who has this question
        const anyStudentWithQuestion = students.find((s) =>
            s.answers.some((a) => a.questionId === questionNumber),
        );

        // Find the answer object for this question
        const answerObj = anyStudentWithQuestion?.answers.find(
            (a) => a.questionId === questionNumber,
        );

        // We don't have the stem text in the breakdown, so just use the question ID
        reportText += `Question Number : ${questionNumber}\n`;
        reportText += `Stem : [marks not available] Question ${questionNumber}\n\n`;

        reportText += `Options : \n`;
        question.optionBreakdown.forEach((option) => {
            reportText += `${option.optionNumber}) Option ${option.optionNumber}\n`;
        });
        reportText += `\n`;

        reportText += `Answer\t\tNumber Of Answers\tPercentage\n`;
        question.optionBreakdown.forEach((option) => {
            const count = option.timesPicked;
            const percentage = option.pickPercentage.toFixed(2);

            reportText += `${option.optionNumber}) \t\t${count}\t\t\t${percentage}\n`;
        });

        reportText += `Total (without invalid answer):  ${question.totalAnswers}\n`;
        reportText += `=====================================================================================================\n\n`;
    });

    return Buffer.from(reportText);
}

export async function generateMarksXlsx(students: StudentBreakdown[]): Promise<Buffer> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Sheet1');

    // Add student data in columns (AUID, Mark)
    sheet.columns = [
        { header: 'AUID', key: 'auid' },
        { header: 'Mark', key: 'mark' },
    ];
    students.forEach((student) => {
        const row: Record<string, string> = {
            auid: student.auid,
            mark: student.mark.toString(),
        };
        sheet.addRow(row);
    });

    const buffer: any = await workbook.xlsx.writeBuffer(); // Bug with exceljs -- have to declare type as any

    return buffer;
}

export async function generateStatsXlsx(examBreakdown: ExamBreakdown): Promise<Buffer> {
    const questions = examBreakdown.questions;
    const students = examBreakdown.students;
    const totalStudents = students.length;

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Sheet1');

    // Add column headers
    const optionColumns = Array.from({ length: 10 }, (_, i) => ({
        header: String(i),
        key: `opt${i}`,
    }));
    sheet.columns = [
        { header: 'Question', key: 'question' },
        { header: 'Correct Count', key: 'correctCount' },
        { header: '%', key: 'percentage' },
        {},
        {},
        {},
        { header: 'Option Index:' },
        ...optionColumns,
        { header: 'Invalid(count)', key: 'invalidCount' },
    ];

    // Insert row containing number of students
    const numStudents: Record<string, number> = { correctCount: totalStudents };
    sheet.addRow(numStudents);

    // Add question statistics
    questions.forEach((q) => {
        const row: Record<string, number | string> = {
            question: q.questionId,
            correctCount: q.totalCorrectAnswers,
            percentage: percentageToDecimal2dp(q.percentageCorrect), // Display percentage as decimal for some reason
            invalidCount: totalStudents - q.totalAnswers,
        };

        // Fill out option columns
        q.optionBreakdown.forEach(
            (o) => (row[`opt${o.optionNumber}`] = percentageToDecimal2dp(o.pickPercentage)),
        );

        sheet.addRow(row);
    });

    const buffer: any = await workbook.xlsx.writeBuffer(); // Bug with exceljs -- have to declare type as any

    return buffer;
}

export async function exportGeneratedStats(examBreakdown: ExamBreakdown): Promise<Buffer> {
    const statsTxtBuffer = generateStatsTxt(examBreakdown);
    const statsXlsxBuffer = await generateStatsXlsx(examBreakdown);
    const marksXlsxBuffer = await generateMarksXlsx(examBreakdown.students);

    // Zip everything
    const archive = archiver('zip', { zlib: { level: 9 } });
    const pass = new PassThrough();
    const chunks: Buffer[] = [];

    // Collect the streamed bytes
    pass.on('data', (chunk) => chunks.push(chunk));

    const finished = new Promise<Buffer>((resolve, reject) => {
        pass.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);
    });

    archive.pipe(pass);

    // Add generated files to zip
    archive.append(statsTxtBuffer, { name: 'Statistics.txt' });
    archive.append(statsXlsxBuffer, { name: 'Statistics.xlsx' });
    archive.append(marksXlsxBuffer, { name: 'Marks.xlsx' });

    await archive.finalize(); // Flush the archive
    return finished;
}
