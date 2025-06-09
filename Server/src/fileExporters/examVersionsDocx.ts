import { Document, ImageRun, Paragraph, TextRun, BorderStyle, type IParagraphOptions } from 'docx';
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

  // Question header (no marks, no border)
  rawParagraphs.push({
    children: [new TextRun({ text: `Question ${question.question.id}`, bold: true })],
  });

  // Prepare options and calculate image space
  const opts = reorderQuestionOptions(question.question.options, optionOrder);
  const reservedHeight = opts.length * OPTION_LINE_HEIGHT_PX;
  const maxImageHeight =
    PAGE_HEIGHT_PX - MARGIN_TOP_PX - MARGIN_BOTTOM_PX - reservedHeight;
  const maxImageWidth = PAGE_WIDTH_PX - MARGIN_LEFT_PX - MARGIN_RIGHT_PX;

  // Question stem content (prepend marks to first text block)
  let markPrepended = false;
  question.question.content.forEach((blk) => {
    if (isQuestionText(blk)) {
      if (!markPrepended) {
        rawParagraphs.push({ text: `${markText} ${blk.questionText}` });
        markPrepended = true;
      } else {
        rawParagraphs.push({ text: blk.questionText });
      }
    } else if (isImageURI(blk) && blk.imageUri) {
      const img = imageFromBase64(blk.imageUri, {
        width: maxImageWidth,
        height: maxImageHeight,
      });
      rawParagraphs.push({ children: [img] });
    } else if (isTableURI(blk)) {
      rawParagraphs.push({ text: '\n[table]\n' });
    }
  });

  // Add a single blank line between question stem and options
  rawParagraphs.push({ text: '' });

  // Options (no blank lines between)
  opts.slice(0, 5).forEach((opt, idx) => {
    const letter = String.fromCharCode(97 + idx);
    rawParagraphs.push({ text: `(${letter}) ${opt}`, indent: { left: 360 } });
  });

  // Convert to Paragraphs, keeping block together
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

function renderExamAppendix(appendix: AppendixPage): Paragraph[] {
  const paras: Paragraph[] = [];
  appendix.appendix.content.forEach((blk) => {
    if (isAppendixText(blk)) {
      paras.push(new Paragraph({ text: blk.appendixText }));
    } else if (isImageURI(blk) && blk.imageUri) {
      const img = imageFromBase64(blk.imageUri);
      paras.push(new Paragraph({ children: [img] }));
    } else if (isTableURI(blk)) {
      paras.push(new Paragraph({ text: '\n[table]\n' }));
    }
  });
  return paras;
}

function renderExamContent(
  examData: ExamData,
  version: VersionedExam,
  qPtr: { current: number }
): Paragraph[] {
  const all: Paragraph[] = [];
  examData.content.forEach((blk) => {
    if (isSection(blk)) all.push(...renderExamSection(blk));
    else if (isAppendixPage(blk)) all.push(...renderExamAppendix(blk));
    else if (isQuestion(blk)) {
      const order = version.optionOrders[qPtr.current]!;
      all.push(...renderExamQuestion(blk, order));
      all.push(new Paragraph({}));
      qPtr.current++;
    }
  });
  return all;
}

export function exportExamVersionsDocx(
  versions: VersionedExam[],
  exam: ExamData
): { versionNumber: string; paragraphs: Paragraph[] }[] {
  return versions.map((v) => {
    const ptr = { current: 0 };
    const paras = renderExamContent(exam, v, ptr);
    return { versionNumber: v.versionNumber, paragraphs: paras };
  });
}
