import JSZip from "jszip";
import ApiError from '../utils/apiError';
import { HTTP_STATUS_CODE, API_ERROR_MESSAGE, API_ERROR_CODE } from '../constants/constants';
import { parseStringPromise } from "xml2js";
import {
  ExamData,
  FeedbackDefaults,
  QuestionText,
  ImageURI,
  TableURI,
  Question,
} from "../dataTypes/examData";

export async function parseDocxFile(file: Buffer | Blob): Promise<ExamData> {
  try {
    const zip = await JSZip.loadAsync(file);

    // build image map from document relationships
    const relsXml = await zip.file("word/_rels/document.xml.rels")?.async("text");
    const imageMap = new Map<string,string>();
    if (relsXml) {
      const relObj = await parseStringPromise(relsXml, { explicitArray: true });
      for (const rel of relObj.Relationships.Relationship || []) {
        const attrs = rel['$'];
        if (attrs.Type?.endsWith("/image")) {
          imageMap.set(attrs.Id, `word/${attrs.Target}`);
        }
      }
    }

    // load main document XML
    const xml = await zip.file("word/document.xml")?.async("text");
    if (!xml) throw new Error("Could not find document.xml in docx");

    // --- New section: extract all <w:tbl>...</w:tbl> snippets as TableURI objects
    const tableMatches = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/g) || [];
    const tableUris: TableURI[] = tableMatches.map(tblXml => ({
      tableUri: tblXml,
      __type: "TableURI",
    } as TableURI));
    // --- end new section

    const parsed = await parseStringPromise(xml, { explicitArray: true });
    const paras: any[] = parsed['w:document']?.['w:body']?.[0]?.['w:p'] || [];

    type LinePiece = string | ImageURI | TableURI;
    const lines: LinePiece[] = [];

    // existing paragraph-run parsing logic...
    for (const para of paras) {
      const runs: any[] = para['w:r'] || [];
      const pieces: LinePiece[] = [];

      for (const r of runs) {
        if (r['w:br']) {
          pieces.push("\n");
        }
        if (r['w:drawing']) {
          // image extraction unchanged
          const blip =
            r['w:drawing'][0]?.['wp:inline']?.[0]
              ?.['a:graphic']?.[0]
              ?.['a:graphicData']?.[0]
              ?.['pic:pic']?.[0]
              ?.['pic:blipFill']?.[0]
              ?.['a:blip']?.[0];
          const rId = blip?.['$']?.['r:embed'];
          if (rId && imageMap.has(rId)) {
            const imgPath = imageMap.get(rId)!;
            const data = await zip.file(imgPath)!.async("base64");
            pieces.push({ imageUri: `data:image/png;base64,${data}`, __type: "ImageURI" } as ImageURI);
          }
        }
        // text (and subscript) unchanged
        const vert = r['w:rPr']?.[0]?.['w:vertAlign']?.[0]?.['$']?.['w:val'];
        const isSub = vert === "subscript";
        const tNode = r['w:t']?.[0];
        let txt = "";
        if (typeof tNode === 'string') txt = tNode;
        else if (tNode?._) txt = tNode._;
        if (txt) pieces.push(isSub ? `_(${txt})` : txt);
      }

      // flatten runs into lines (unchanged)
      let buf = "";
      for (const piece of pieces) {
        if (typeof piece === 'string') {
          for (const segment of piece.split("\n")) {
            buf += segment;
            if (segment !== piece.split("\n").slice(-1)[0]) {
              if (buf.trim()) lines.push(buf.trim());
              buf = "";
            }
          }
        } else {
          if (buf.trim()) {
            lines.push(buf.trim());
            buf = "";
          }
          lines.push(piece);
        }
      }
      if (buf.trim()) lines.push(buf.trim());
    }

    // --- Append extracted table URIs into the sequence of pieces
    for (const tbl of tableUris) {
      lines.push(tbl);
    }
    // --- end table insertion

    // map lines into examContent as before
    const examContent: ExamData['content'] = [];
    let currentQ: Question['question'] | null = null;
    let qId = 1;

    for (const piece of lines) {
      if (typeof piece !== 'string') {
        if (currentQ) currentQ.content.push(piece);
        continue;
      }

      const m = piece.match(/^\[(\d+)\s*mark[s]?\]\s*(.*)/i);
      if (m) {
        if (currentQ) examContent.push({ question: currentQ });
        currentQ = {
          id: qId++,
          marks: parseInt(m[1]!, 10),
          feedback: FeedbackDefaults,
          content: [{ questionText: m[2]! } as QuestionText],
          options: [],
        };
      } else if (currentQ) {
        if (/^[ivx]+\.\s*/i.test(piece)) {
          currentQ.content.push({ questionText: piece } as QuestionText);
        } else {
          currentQ.options.push(piece);
        }
      }
    }
    if (currentQ) examContent.push({ question: currentQ });

    return { content: examContent };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      HTTP_STATUS_CODE.SERVER_ERROR,
      API_ERROR_MESSAGE.serverError,
      API_ERROR_CODE.SERVER_ERROR,
      { message: err instanceof Error ? err.message : String(err) },
      true
    );
  }
}
