import { Coverpage } from '../dataTypes/coverpage';
import path from 'path';
import fs from 'fs';
import PizZip from 'pizzip';
// import Docxtemplater from 'docxtemplater';

export function getCoverpageXml(
    coverpage: Coverpage,
    template: string = path.join(__dirname, 'coverpageTemplate.docx'),
): { documentXml: string; headerXml: string } {
    const content = fs.readFileSync(template, 'binary');
    const zip = new PizZip(content);

    let documentXml = zip.file('word/document.xml')!.asText();
    let headerXml = zip.file('word/header1.xml')!.asText();

    const data = coverpage.coverpage.content;

    // Replace placeholders in document.xml
    documentXml = documentXml.replace(/semester/g, data.semester || '');
    documentXml = documentXml.replace(/campus/g, data.campus || '');
    documentXml = documentXml.replace(/department/g, data.department || '');
    documentXml = documentXml.replace(/courseCode/g, data.courseCode || '');
    documentXml = documentXml.replace(/examTitle/g, data.examTitle || '');
    documentXml = documentXml.replace(/duration/g, data.duration || '');
    documentXml = documentXml.replace(/noteContent/g, data.noteContent || '');

    // Replace placeholders in header
    headerXml = headerXml.replace(/versionNumber/g, data.versionNumber || '');
    headerXml = headerXml.replace(/courseName/g, data.courseName || '');

    return { documentXml, headerXml };
}

export function extractCoverpageBody(documentXml: string): string {
    // Extract just the body content (everything inside <w:body>)
    const bodyMatch = documentXml.match(/<w:body[^>]*>(.*)<\/w:body>/s);
    return bodyMatch ? bodyMatch[1] || '' : '';
}
