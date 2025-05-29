import { Document, Packer } from 'docx';
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
  if (outputs.length === 0) {
    throw new Error(
      `exportExamVersionsDocx returned no output for version ${version.versionNumber}`
    );
  }

  // 2) grab the first element — use `!` to tell TS it’s definitely there
  const vOutput = outputs[0]!;

  // 3) build the .docx
  const doc = new Document({
  title: `Exam Version ${version.versionNumber}`,
  sections: [
    {
      // no `headers` key at all
      properties: {},
      children: vOutput.paragraphs,
    },
  ],
});

  const docxBuffer = await Packer.toBuffer(doc);

  const coverpageBlock = exam.content.find(isCoverpage);
  if (!coverpageBlock) {
    throw new Error('No coverpage found in exam.content');
  }
  coverpageBlock.coverpage.content.versionNumber = version.versionNumber;

  const { documentXml, headerXml } = getCoverpageXml(coverpageBlock);
  const coverpageBody = extractCoverpageBody(documentXml);

  return injectCoverpage(docxBuffer, coverpageBody, headerXml);
}
