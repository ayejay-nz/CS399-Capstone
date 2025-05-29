import JSZip from 'jszip';
import ApiError from '../utils/apiError';
import { HTTP_STATUS_CODE, API_ERROR_MESSAGE, API_ERROR_CODE } from '../constants/constants';
import { Coverpage } from '../dataTypes/coverpage';

export async function parseCoverPage(file: Buffer | Blob, xmlContent?: string): Promise<Coverpage | Buffer> {
    try {
        const zip = await JSZip.loadAsync(file);
        const xml = xmlContent ?? await zip.file('word/document.xml')?.async('text');
        if (!xml) throw new Error('Missing word/document.xml');

        // Check all header files in the word/ directory
        const headerFiles = Object.keys(zip.files).filter(
            (filename) => filename.startsWith('word/header') && filename.endsWith('.xml'),
        );

        // If no header files exist, return the file buffer
        if (headerFiles.length === 0) {
            if (file instanceof Buffer) {
                return file;
            } else {
                return Buffer.from(await (file as Blob).arrayBuffer());
            }
        }

        let courseName = '';
        let headerFound = false;

        // Try to extract courseName from any available header file
        for (const headerFile of headerFiles) {
            const headerXml = await zip.file(headerFile)?.async('text');
            if (headerXml) {
                const headerTexts: string[] = Array.from(
                    headerXml.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g),
                    (m) => m[1]!.trim(),
                ).filter((t) => t.length > 0);

                if (headerTexts.length > 1) {
                    console.log(headerTexts);
                    courseName = headerTexts[2] ?? headerTexts[1] ?? '';
                    headerFound = true;
                    break;
                }
            }
        }

        // If no valid header content found, return the file buffer
        if (!headerFound) {
            if (file instanceof Buffer) {
                return file;
            } else {
                return Buffer.from(await (file as Blob).arrayBuffer());
            }
        }

        const paras = xml.split(/<\/w:p>/);

        const allTexts: string[] = paras
            .map((p) => {
                const texts = Array.from(p.matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g), (m) => m[1]!);
                const joined = texts.join('');
                return joined;
            })
            .filter((t) => t.trim().length > 0);

        const semester = allTexts[1] ?? '';
        const campus = allTexts[2] ?? '';
        const department = allTexts[3] ?? '';
        const courseCode = allTexts[4] ?? '';
        const examTitle = allTexts[5] ?? '';
        const duration = allTexts[6] ?? '';

        const noteStart = allTexts.findIndex((t) => t === 'NOTE:');
        let noteContent = '';
        if (noteStart !== -1) {
            noteContent = allTexts.slice(noteStart + 1).join('\n');
        }

        // Check if any required field is undefined or empty
        const requiredFields = [
            semester,
            campus,
            department,
            courseCode,
            examTitle,
            duration,
            noteContent,
        ];
        if (requiredFields.some((field) => !field || field.trim() === '')) {
            if (file instanceof Buffer) {
                return file;
            } else {
                return Buffer.from(await (file as Blob).arrayBuffer());
            }
        }

        return {
            coverpage: {
                isUploaded: true,
                content: {
                    semester,
                    campus,
                    department,
                    courseCode,
                    examTitle,
                    duration,
                    noteContent,
                    versionNumber: undefined,
                    courseName,
                },
            },
        };
    } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(
            HTTP_STATUS_CODE.SERVER_ERROR,
            API_ERROR_MESSAGE.serverError,
            API_ERROR_CODE.SERVER_ERROR,
            { message: err instanceof Error ? err.message : String(err) },
            true,
        );
    }
}
