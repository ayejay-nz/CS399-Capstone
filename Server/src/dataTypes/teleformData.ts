type AnswerCode = "01" | "02" | "04" | "08" | "16";

export interface StudentTeleformData {
  auid: string;
  lastName: string;
  firstName: string;
  courseNumber: string;
  versionNumber: string;
  answers: number[];
}

export interface TeleformData {
  studentAnswers: StudentTeleformData[];
}
