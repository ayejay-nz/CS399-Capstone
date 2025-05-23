import { Workbook } from 'exceljs';
import { ExamBreakdown, StudentBreakdown } from '../dataTypes/examBreakdown';

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
