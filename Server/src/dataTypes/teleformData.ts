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
