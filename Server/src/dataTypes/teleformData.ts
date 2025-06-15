export interface StudentTeleformData {
    auid: string;
    lastName: string;
    middleInitial?: string;
    firstName: string;
    courseNumber: string;
    versionNumber: string;
    answers: (number | null)[];
}

export interface TeleformData {
    studentAnswers: StudentTeleformData[];
}
