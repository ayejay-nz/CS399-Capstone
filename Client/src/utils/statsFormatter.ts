import { ExamBreakdown, StudentBreakdown } from "@/src/dataTypes/examBreakdown";

// Format the overall statistics into a plain-text report.
export function formatStatsTxt(exam: ExamBreakdown): string {
  const { students, questions } = exam;
  const courseNumber = students[0]?.versionNumber.substring(0, 3) || 'Unknown';
  const studentCount = students.length;

  const lines: string[] = [];
  lines.push(`Course: ${courseNumber}`);
  lines.push(`Students Count: ${studentCount}`);
  lines.push('');

  questions.forEach((q) => {
    const questionNumber = q.questionId;
    lines.push(`Question Number : ${questionNumber}`);
    lines.push(`Stem : [marks not available] Question ${questionNumber}`);
    lines.push('');

    lines.push('Options : ');
    q.optionBreakdown.forEach((opt) => {
      lines.push(`${opt.optionNumber}) Option ${opt.optionNumber}`);
    });
    lines.push('');

    lines.push('Answer\t\tNumber Of Answers\tPercentage');
    q.optionBreakdown.forEach((opt) => {
      const count = opt.timesPicked;
      const percentage = opt.pickPercentage.toFixed(2);
      lines.push(`${opt.optionNumber}) \t\t${count}\t\t\t${percentage}`);
    });
    lines.push(`Total (without invalid answer):  ${q.totalAnswers}`);
    lines.push('=====================================================================================================');
    lines.push('');
  });

  return lines.join('\n');
}

// Format one student’s answers into plain-text layout.

export function formatStudentResultText(
  student: StudentBreakdown,
  title = 'Student Results'
): string {
  const lines: string[] = [];

  // Header
  lines.push(title);
  lines.push(`AUID: ${student.auid}`);
  lines.push(`Name: ${student.firstName} ${student.lastName}`);
  lines.push(`Version: ${student.versionNumber}`);
  lines.push('--------------------------------------------------------------------------');
  lines.push('');

  // Each question block
  for (const ans of student.answers) {
    const letter =
      ans.optionSelected != null
        ? String.fromCharCode(65 + Math.log2(ans.optionSelected))
        : '';
    const feedback = ans.feedback ?? 'No feedback.';
    const mark = ans.mark ?? 0;

    lines.push(`Question: ${ans.questionId}`);
    lines.push(`Your answer is: ${letter}`);
    lines.push(`Feedback: ${feedback}`);
    lines.push(`Mark: ${mark}`);
    lines.push('');
  }

  return lines.join('\n');
}