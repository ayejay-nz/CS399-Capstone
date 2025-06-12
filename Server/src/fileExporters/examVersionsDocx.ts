import { Document, ImageRun, Paragraph, TextRun, BorderStyle, type IParagraphOptions, Header, AlignmentType, PageNumberElement, SectionType } from 'docx';
import { ExamData, Question, Section } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { generateExamVersions } from '../services/examVersioning';
import {
  isQuestion,
  isQuestionText,
  isImageURI,
  isTableURI,
  isSection,
  isSectionText,
  isAppendixPage,
  isAppendixText,
} from '../utils/typeGuards';
import { imageSize } from 'image-size';
import ApiError from '../utils/apiError';
import { API_ERROR_CODE, API_ERROR_MESSAGE, HTTP_STATUS_CODE } from '../constants/constants';
import { AppendixPage } from '../dataTypes/coverpage';

// Page layout constants
const PAGE_WIDTH_PX = 600;
const PAGE_HEIGHT_PX = 800;
const MARGIN_TOP_PX = 72;
const MARGIN_BOTTOM_PX = 72;
const MARGIN_LEFT_PX = 72;
const MARGIN_RIGHT_PX = 72;
const OPTION_LINE_HEIGHT_PX = 20;

function reorderQuestionOptions(options: string[], optionOrder: number[] | null): string[] {
  if (!optionOrder || optionOrder.length !== options.length) return options;
  return optionOrder.map((i) => options[i]!);
}

function imageFromBase64(
  b64: string,
  maxDimensions?: { width: number; height: number }
): ImageRun {
  const cleaned = b64.replace(/^data:[^;]+;base64,/, '');
  const data = Buffer.from(cleaned, 'base64');
  const match = b64.match(/^data:image\/(\w+);base64,/);
  const rawType = match?.[1]?.toLowerCase() ?? '';

  let format: 'jpg' | 'png' | 'gif' | 'bmp';
  switch (rawType) {
    case 'jpeg':
    case 'jpg': format = 'jpg'; break;
    case 'png': format = 'png'; break;
    case 'gif': format = 'gif'; break;
    case 'bmp': format = 'bmp'; break;
    default:
      throw new ApiError(
        HTTP_STATUS_CODE.UNSUPPORTED_MEDIA_TYPE,
        API_ERROR_MESSAGE.invalidFileFormat,
        API_ERROR_CODE.INVALID_FILE_FORMAT
      );
  }

  const { width: origW, height: origH } = imageSize(data);
  let width = origW;
  let height = origH;

  if (maxDimensions) {
    const { width: maxW, height: maxH } = maxDimensions;
    const scale = Math.min(1, maxW / origW, maxH / origH);
    width = Math.floor(origW * scale);
    height = Math.floor(origH * scale);
  }

  return new ImageRun({
    type: format,
    data,
    transformation: { width, height },
    altText: { name: 'image' }
  });
}

function renderExamQuestion(
  question: Question,
  optionOrder: number[] | null
): Paragraph[] {
  // Build a block of paragraphs to keep together
  const rawParagraphs: Partial<IParagraphOptions>[] = [];
  // Default to 1 mark if unspecified
  const marks = question.question.marks ?? 1;
  const markText = `[${marks} mark${marks === 1 ? '' : 's'}]`;

  const opts = reorderQuestionOptions(question.question.options, optionOrder);
  const reservedHeight = opts.length * OPTION_LINE_HEIGHT_PX;
  const maxImageHeight =
    PAGE_HEIGHT_PX - MARGIN_TOP_PX - MARGIN_BOTTOM_PX - reservedHeight;
  const maxImageWidth = PAGE_WIDTH_PX - MARGIN_LEFT_PX - MARGIN_RIGHT_PX;

  // 1) Build the question header + first line of stem
  let markPrepended = false;
  question.question.content.forEach((blk) => {
    if (isQuestionText(blk)) {
      // split on literal "\n"
      const lines = blk.questionText.split('\n');

      if (!markPrepended) {
        // First paragraph: header only
        rawParagraphs.push({
          children: [
            new TextRun({ text: `Question ${question.question.id}`, bold: true }),
          ],
        });
        // Paragraph 2: mark + first line
        rawParagraphs.push({
          children: [
            new TextRun({ text: markText }),
            new TextRun({ text: ' ' + lines[0] }),
          ],
        });

        // If the stem had more lines, each gets its own paragraph:
        for (let i = 1; i < lines.length; i++) {
          rawParagraphs.push({
            children: [ new TextRun({ text: lines[i] }) ]
          });
        }

      } else {
        // For any later text blocks: each line as its own paragraph
        lines.forEach(line => {
          rawParagraphs.push({
            children: [ new TextRun({ text: line }) ]
          });
        });
      }

      markPrepended = true;

    } else if (isImageURI(blk) && blk.imageUri) {
      // images
      const img = imageFromBase64(blk.imageUri, {
        width: maxImageWidth,
        height: maxImageHeight,
      });
      rawParagraphs.push({ children: [img] });

    } else if (isTableURI(blk)) {
      rawParagraphs.push({ text: '\n[table]\n' });
    }
  });

  // 2) Blank line before options
  rawParagraphs.push({ text: '' });

  // 3) Options list
  opts.slice(0, 5).forEach((opt, idx) => {
    const letter = String.fromCharCode(97 + idx);
    rawParagraphs.push({
      text: `(${letter}) ${opt}`,
      indent: { left: 360 },
    });
  });

  // 4) Convert to actual Paragraph objects
  return rawParagraphs.map((paraOpts, idx) =>
    new Paragraph({
      ...paraOpts,
      keepNext: idx < rawParagraphs.length - 1,
    })
  );
}

function renderExamSection(section: Section): Paragraph[] {
  const paras: Paragraph[] = [];
  section.section.content.forEach((blk) => {
    if (isSectionText(blk)) {
      paras.push(new Paragraph({ text: blk.sectionText }));
    } else if (isImageURI(blk) && blk.imageUri) {
      const img = imageFromBase64(blk.imageUri);
      paras.push(new Paragraph({ children: [img] }));
    } else if (isTableURI(blk)) {
      paras.push(new Paragraph({ text: '\n[table]\n' }));
    }
  });
  paras.push(new Paragraph({}));
  return paras;
}

function createHeader(versionNumber: string): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `Version ${versionNumber}`, bold: true }),
          new TextRun({ text: '\t\t' }),   // push "Page" to the right
          new TextRun({ text: 'Page ' }),
          new PageNumberElement(),         // real page number element
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
  });
}

function createAppendixHeader(versionNumber: string): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'APPENDIX', bold: true }),
          new TextRun({ text: '\t\t' }),
          new TextRun({ text: 'Page ' }),
          new PageNumberElement(),         // real page number element
        ],
        alignment: AlignmentType.LEFT,
      }),
    ],
  });
}

function renderExamAppendix(appendix: AppendixPage): Paragraph[] {
  const paras: Paragraph[] = [];
  
  // Add a page break before each appendix
  paras.push(new Paragraph({
    pageBreakBefore: true
  }));

  // Render appendix content
  appendix.appendix.content.forEach((blk) => {
    if (isAppendixText(blk)) {
      paras.push(new Paragraph({ 
        text: blk.appendixText,
        keepNext: true // Keep content together
      }));
    } else if (isImageURI(blk) && blk.imageUri) {
      const img = imageFromBase64(blk.imageUri);
      paras.push(new Paragraph({ 
        children: [img],
        keepNext: true // Keep content together
      }));
    } else if (isTableURI(blk)) {
      paras.push(new Paragraph({ 
        text: '\n[table]\n',
        keepNext: true // Keep content together
      }));
    }
  });

  return paras;
}

function renderExamQuestionBlocks(blk: any, version: VersionedExam, qPtr: { current: number }): Paragraph[] {
  if (isQuestion(blk)) {
    const order = version.optionOrders[qPtr.current]!;
    const paras = renderExamQuestion(blk, order);
    // Add spacing after each question
    paras.push(new Paragraph({}));
    qPtr.current++;
    return paras;
  } else if (isSection(blk)) {
    return renderExamSection(blk);
  }
  return [];
}

function renderAppendixBlocks(blk: any): Paragraph[] {
  if (isAppendixPage(blk)) {
    return renderExamAppendix(blk);
  }
  return [];
}

export function exportExamVersionsDocx(
  versions: VersionedExam[],
  exam: ExamData
): { versionNumber: string; paragraphs: Paragraph[] }[] {
  return versions.map((v) => {
    // pointer for question ordering
    const ptr = { current: 0 };
    const children: Paragraph[] = [];
    let lastWasAppendix = false;

    for (const blk of exam.content) {
      if (isAppendixPage(blk)) {
        // render the appendix (renderExamAppendix already adds a pageBreakBefore on its first para)
        children.push(...renderExamAppendix(blk));
        lastWasAppendix = true;
      } else {
        // if the previous block was an appendix, force the next question onto its own page
        if (lastWasAppendix) {
          children.push(new Paragraph({ pageBreakBefore: true }));
        }
        // render questions or sections
        children.push(...renderExamQuestionBlocks(blk, v, ptr));
        lastWasAppendix = false;
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: MARGIN_TOP_PX,
                bottom: MARGIN_BOTTOM_PX,
                left: MARGIN_LEFT_PX,
                right: MARGIN_RIGHT_PX,
              },
            },
          },
          headers: {
            default: createHeader(v.versionNumber),
            first: createHeader(v.versionNumber),
          },
          children,
        },
      ],
    });

    return {
      versionNumber: v.versionNumber,
      paragraphs: children,
    };
  });
}




