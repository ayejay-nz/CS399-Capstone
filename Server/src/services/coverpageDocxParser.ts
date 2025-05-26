import JSZip from 'jszip';
import ApiError from '../utils/apiError';
import { HTTP_STATUS_CODE, API_ERROR_MESSAGE, API_ERROR_CODE } from '../constants/constants';
import { CoverpageDocx, Coverpage, AppendixPage } from '../dataTypes/coverpage';
import { parseCoverPage } from '../parsers/coverPageParser';
import { parseAppendicePage } from '../parsers/appendiceParser';

/**
 * Splits a multi-page DOCX file into separate pages and parses them
 * First page becomes the coverpage, remaining pages become appendices
 */
export async function parseCoverpageDocx(file: Buffer | Blob): Promise<CoverpageDocx | Buffer> {
    try {
        const zip = await JSZip.loadAsync(file);
        
        // Load main document XML
        const xml = await zip.file('word/document.xml')?.async('text');
        if (!xml) throw new Error('Missing word/document.xml');

        // Split XML content at page breaks
        const pageBreakRegex = /<w:br[^>]*w:type="page"[^>]*\/>/g;
        const xmlPages = xml.split(pageBreakRegex);
        
        // Filter out empty XML sections
        const validXmlPages = xmlPages.filter(page => page.trim());
        
        if (validXmlPages.length === 0) {
            throw new ApiError(
                HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
                API_ERROR_MESSAGE.parsingFailed,
                API_ERROR_CODE.PARSING_FAILED,
                { message: 'No valid pages found in document' },
                true
            );
        }

        // Parse first page as coverpage
        const coverpageResult = await parseCoverPage(file, validXmlPages[0]);
        
        // Parse remaining pages as appendices (these will always succeed)
        const appendices: AppendixPage[] = [];
        for (let i = 1; i < validXmlPages.length; i++) {
            const appendixResult = await parseAppendicePage(file, validXmlPages[i]);
            appendices.push(appendixResult);
        }

        // If coverpage parsing failed but we have appendices, return only appendices
        // TODO: Store coverpage buffer for manual processing
        if (Buffer.isBuffer(coverpageResult)) {
            if (appendices.length > 0) {
                return {
                    content: appendices
                };
            } else {
                // No appendices and coverpage failed - return original buffer
                // TODO: Do something better here
                return file instanceof Buffer ? file : Buffer.from(await (file as Blob).arrayBuffer());
            }
        }

        // Both coverpage and appendices parsed successfully
        return {
            content: [coverpageResult, ...appendices]
        };

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

 