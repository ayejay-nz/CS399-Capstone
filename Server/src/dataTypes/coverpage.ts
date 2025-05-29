import { BrandType, ImageURI, TableURI } from './examData';

export type AppendixText = BrandType<{ appendixText: string }, 'AppendixText'>;

export interface AppendixPage {
    appendix: {
        isUploaded: boolean;
        content: (AppendixText | ImageURI | TableURI)[];
    };
}

export interface Coverpage {
    coverpage: {
        isUploaded: boolean;
        content: {
            semester: string;
            campus: string;
            department: string;
            courseCode: string;
            examTitle: string;
            duration: string;
            noteContent: string;
            versionNumber?: string;
            courseName: string;
        };
    };
}

export interface CoverpageDocx {
    content: (Coverpage | AppendixPage)[]; // ensure coverpage is first and only appears once if present
}
