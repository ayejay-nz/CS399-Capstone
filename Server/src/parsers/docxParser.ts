import JSZip from 'jszip';
import ApiError from '../utils/apiError';
import { parseStringPromise } from 'xml2js';
import {
    ExamData,
    FeedbackDefaults,
    QuestionText,
    ImageURI,
    TableURI,
    Question,
    MathBlock,
} from '../dataTypes/examData';
import { HTTP_STATUS_CODE, API_ERROR_MESSAGE, API_ERROR_CODE } from '../constants/constants';

function insertRomanLineBreaks(text: string): string {
  return text.replace(
    /(^|\s)(i{1,3}|iv|v)\s*\./gi,
    (_, before, numerals) => `${before}\n${numerals}.`
  );
}

export async function parseDocxFile(file: Buffer | Blob): Promise<ExamData> {
    try {
        const zip = await JSZip.loadAsync(file);

        //build image map from document rels
        const relsXml = await zip.file('word/_rels/document.xml.rels')?.async('text');
        const imageMap = new Map<string, string>();
        if (relsXml) {
            const relObj = await parseStringPromise(relsXml, { explicitArray: true });
            for (const rel of relObj.Relationships.Relationship || []) {
                const attrs = rel['$'];
                if (attrs.Type?.endsWith('/image')) {
                    imageMap.set(attrs.Id, `word/${attrs.Target}`);
                }
            }
        }

        const xml = await zip.file('word/document.xml')?.async('text');
        if (!xml) throw new Error('Could not find document.xml in docx');

        const tableMatches = xml.match(/<w:tbl[\s\S]*?<\/w:tbl>/g) || [];
        const tableUris: TableURI[] = tableMatches.map((tblXml: any) => ({
            tableUri: tblXml,
            __type: 'TableURI',
        }));

        const mathMatches: string[] = [];
        const p1 = xml.match(/<m:oMathPara[\s\S]*?<\/m:oMathPara>/g);
        if (p1) mathMatches.push(...p1);
        const p2 = xml.match(/<m:oMath[\s\S]*?<\/m:oMath>/g);
        if (p2) mathMatches.push(...p2);
        const mathBlocks: MathBlock[] = mathMatches.map((mathXml) => ({
            mathXml,
            __type: 'MathBlock',
        }));

        const parsed = await parseStringPromise(xml, {
            explicitArray: true,
            explicitChildren: true,
            preserveChildrenOrder: true,
            childkey: '$$',
        });
        const paras: any[] = parsed['w:document']?.['w:body']?.[0]?.['w:p'] || [];

        type LinePiece = string | ImageURI | TableURI | MathBlock;
        const lines: LinePiece[] = [];

        for (const para of paras) {
            const pieces: LinePiece[] = [];
            const children = para.$$ || [];

            for (const node of children) {
                switch (node['#name']) {
                    case 'w:spacing':
                        pieces.push(' ');
                        break;
                    case 'w:br':
                        pieces.push('\n');
                        break;
                    case 'w:r':
                        if (node.$$) {
                            const drw = node.$$.find((c: any) => c['#name'] === 'w:drawing');
                            if (drw) {
                                const inline = drw.$$.find((c: any) => c['#name'] === 'wp:inline');
                                const blip = inline
                                    ? inline.$$.find((c: any) => c['#name'] === 'a:graphic')
                                          ?.$$.find((c: any) => c['#name'] === 'a:graphicData')
                                          ?.$$.find((c: any) => c['#name'] === 'pic:pic')
                                          ?.$$.find((c: any) => c['#name'] === 'pic:blipFill')
                                          ?.$$.find((c: any) => c['#name'] === 'a:blip')
                                    : null;
                                const rId = blip?.$?.['r:embed'];
                                if (rId && imageMap.has(rId)) {
                                    const imgPath = imageMap.get(rId)!;
                                    const data = await zip.file(imgPath)!.async('base64');
                                    const size =
                                        inline?.$?.cx && inline?.$?.cy
                                            ? inline.$
                                            : inline.$$.find((c: any) => c['#name'] === 'wp:extent')
                                                  ?.$ || {};
                                    pieces.push({
                                        imageUri: `data:image/png;base64,${data}`,
                                        width: Number(size.cx) || 0,
                                        height: Number(size.cy) || 0,
                                        __type: 'ImageURI',
                                    } as ImageURI);
                                    break;
                                }
                            }
                            const mathNode = node.$$.find((c: any) =>
                                c['#name']?.startsWith('m:oMath'),
                            );
                            if (mathNode) {
                                const raw = mathMatches.find((m) => xml.includes(m))!;
                                pieces.push({ mathXml: raw, __type: 'MathBlock' } as MathBlock);
                                break;
                            }
                            //Plain text
                            const tNode = node.$$.find((c: any) => c['#name'] === 'w:t');
                            if (tNode && typeof tNode._ === 'string') {
                                //detect subscript runs
                                const rPr = node.$$.find((c: any) => c['#name'] === 'w:rPr');
                                const isSub = rPr?.$$?.some(
                                    (c: any) =>
                                        c['#name'] === 'w:vertAlign' && c.$.val === 'subscript',
                                );
                                let text = tNode._;
                                if (isSub) {
                                    text = `_${'(' + text + ')'}`;
                                }
                                pieces.push(text);
                            }
                        }
                        break;
                }
            }
            let buf = '';
            for (const piece of pieces) {
                if (typeof piece === 'string') {
                    const segs = piece.split('\n');
                    segs.forEach((seg, i) => {
                        const isRomanRun = /^[ivx]+$/i.test(buf) && /^[ivx]+$/i.test(seg.trim());
                        if (
                            buf &&
                            !buf.endsWith(' ') && //it doesn’t end in a space
                            !seg.startsWith(' ') && //the new bits don’t start with space
                            !isRomanRun
                        ) {
                            buf += ' ';
                        }
                        buf += seg;
                        if (i < segs.length - 1 && buf.trim()) {
                            lines.push(buf.trim());
                            buf = '';
                        }
                    });
                } else {
                    if (buf.trim()) {
                        lines.push(buf.trim());
                        buf = '';
                    }
                    lines.push(piece);
                }
            }
            if (buf.trim()) lines.push(buf.trim());
        }
        for (const tbl of tableUris) lines.push(tbl);
        for (const math of mathBlocks) lines.push(math);

        //build questions
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
                if (currentQ) {
                    let allText = currentQ.content
                    .filter((c) => c.__type === 'QuestionText')
                    .map((c: QuestionText) => c.questionText)
                    .join('\n');
                    allText = insertRomanLineBreaks(allText);
                    const rest = currentQ.content.filter((c) => c.__type !== 'QuestionText');
                    currentQ.content = [
                        { __type: 'QuestionText', questionText: allText } as QuestionText,
                        ...rest,
                    ];
                    examContent.push({ question: currentQ });
                }

                currentQ = {
                    id: qId++,
                    marks: parseInt(m[1]!, 10),
                    feedback: FeedbackDefaults,
                    content: [{ __type: 'QuestionText', questionText: m[2]! } as QuestionText],
                    options: [],
                };
            } else if (currentQ) {
                const raw = piece.trim();
                const normalized = raw.replace(/^([ivx]+)\s*\.\s*/i, '$1. ');
                if (/^[ivx]+\.\s*/i.test(normalized)) {
                    currentQ.content.push({
                        __type: 'QuestionText',
                        questionText: normalized,
                    } as QuestionText);
                } else {
                    let opt = normalized;

                    function collapseRuns(str: string) {
                        return str.replace(/\b([ivx]+|\d+)\s+([ivx]+|\d+)\b/gi, (_, a, b) => {
                            const merged = (a + b).toLowerCase();
                            if (/^(?:[ivx]{1,3}|iv|v|vi|vii|viii|ix|x|\d+)$/i.test(merged)) {
                                return merged;
                            }
                            return `${a} ${b}`;
                        });
                    }

                    let prev: string;
                    do {
                        prev = opt;
                        opt = collapseRuns(opt);
                    } while (opt !== prev);
                    //collapse multiple spaces and normalize commas
                    opt = opt.replace(/\s*,\s*/g, ', ').replace(/\s{2,}/g, ' ');

                    currentQ.options.push(opt);
                }
            }
        }

        if (currentQ) {
            const allText = currentQ.content
                .filter((c) => c.__type === 'QuestionText')
                .map((c: QuestionText) => c.questionText)
                .join('\n');
            const rest = currentQ.content.filter((c) => c.__type !== 'QuestionText');
            currentQ.content = [
                { __type: 'QuestionText', questionText: allText } as QuestionText,
                ...rest,
            ];
            examContent.push({ question: currentQ });
        }

        return { content: examContent };
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