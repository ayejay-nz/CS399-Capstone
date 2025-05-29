import { Coverpage } from '../dataTypes/coverpage';
import path from 'path';
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export function buildCoverpageDocx(
    coverpage: Coverpage,
    template: string = path.join(__dirname, 'coverpageTemplate.docx'),
): Buffer {
    const content = fs.readFileSync(template, 'binary');

    // Prepare template coverpage
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // Merge the data and render it
    const data = coverpage.coverpage.content;
    doc.render(data);

    // Get resulting docx buffer
    const buf = doc.toBuffer();

    return buf;
}
