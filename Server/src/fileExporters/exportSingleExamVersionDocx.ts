import { Document, Packer, Paragraph } from 'docx';
import { ExamData } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { exportExamVersionsDocx } from './examVersionsDocx';
import { isCoverpage } from '../utils/typeGuards';
import { getCoverpageXml, extractCoverpageBody } from './coverpageDocx';
import { injectCoverpage } from './examGenerator';

export async function exportSingleExamVersionDocx(
  exam: ExamData,
  version: VersionedExam
): Promise<Buffer> {
  // 1) generate the paragraphs
  const outputs = exportExamVersionsDocx([version], exam);
  if (!outputs.length) throw new Error(`No output for version ${version.versionNumber}`);
  const vOutput = outputs[0]!;

  // 2) build a Document with *only* a first‐page header
  const doc = new Document({
    title: `Exam Version ${version.versionNumber}`,
    sections: [
      {
        headers: {
          first: {
            options: {
              // stub so that header1.xml is created
              children: [ new Paragraph({ text: '' }) ],
            },
          },
        },
        children: vOutput.paragraphs,
      },
    ],
  });

  // 3) pack to .docx
  let docxBuffer = await Packer.toBuffer(doc);

  // 4) inject your real coverpage as header1.xml
  const coverpageBlock = exam.content.find(isCoverpage);
  if (!coverpageBlock) throw new Error('No coverpage found');
  coverpageBlock.coverpage.content.versionNumber = version.versionNumber;
  const { documentXml, headerXml } = getCoverpageXml(coverpageBlock);
  const coverpageBody = extractCoverpageBody(documentXml);

  return injectCoverpage(docxBuffer, coverpageBody, headerXml);
}
