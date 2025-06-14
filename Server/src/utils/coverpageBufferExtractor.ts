import JSZip from 'jszip';
import { Buffer } from 'buffer';

/**
 * Extracts only the coverpage portion from a multi-page DOCX
 * @param originalBuffer - The original DOCX buffer
 * @param firstPageXml - The XML content of the first page
 * @returns Buffer containing only the coverpage as a valid DOCX
 */
export async function extractCoverpageBuffer(
    originalBuffer: Buffer,
    firstPageXml: string,
): Promise<Buffer> {
    try {
        console.log('[DEBUG] Starting coverpage buffer extraction...');
        const originalZip = await JSZip.loadAsync(originalBuffer);
        const newZip = new JSZip();

        // Copy ALL files from the original except word/document.xml
        // This preserves relationships, styles, themes, etc.
        let fileCount = 0;
        for (const [filename, file] of Object.entries(originalZip.files)) {
            if (filename !== 'word/document.xml' && !file.dir) {
                const content = await file.async('nodebuffer');
                newZip.file(filename, content);
                fileCount++;
            }
        }
        console.log(`[DEBUG] Copied ${fileCount} files from original DOCX`);

        // Get the original document.xml
        const originalDocXml = await originalZip.file('word/document.xml')?.async('text');
        if (!originalDocXml) {
            throw new Error('Could not find original document.xml');
        }

        // Create new document.xml with conservative approach
        const newDocXml = createMinimalDocumentXml(originalDocXml, firstPageXml);
        newZip.file('word/document.xml', newDocXml);

        console.log('[DEBUG] Generated new document.xml');

        const result = await newZip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 },
        });

        console.log(`[DEBUG] Generated DOCX buffer: ${result.length} bytes`);
        return result;
    } catch (error) {
        console.error('[ERROR] Failed to extract coverpage buffer:', error);
        // Return original buffer as fallback
        return originalBuffer;
    }
}

/**
 * Fixes unclosed XML tags in the extracted first page content
 */
function fixUnmatchedTags(xmlContent: string): string {
    try {
        // Find all opening tags that don't have self-closing syntax
        const openingTags: string[] = [];
        const tagRegex = /<(w:\w+)(?:\s[^>]*)?>/g;
        const selfClosingRegex = /<(w:\w+)(?:\s[^>]*)?\/>/g;
        const closingRegex = /<\/(w:\w+)>/g;

        let match;

        // Track opening tags
        while ((match = tagRegex.exec(xmlContent)) !== null) {
            const tagName = match[1];
            // Skip if it's a self-closing tag
            if (!match[0].endsWith('/>')) {
                openingTags.push(tagName!);
            }
        }

        // Remove closing tags from our stack
        while ((match = closingRegex.exec(xmlContent)) !== null) {
            const tagName = match[1];
            const lastIndex = openingTags.lastIndexOf(tagName!);
            if (lastIndex !== -1) {
                openingTags.splice(lastIndex, 1);
            }
        }

        // Add closing tags for any remaining unclosed tags (in reverse order)
        let fixedContent = xmlContent;
        for (let i = openingTags.length - 1; i >= 0; i--) {
            fixedContent += `</${openingTags[i]}>`;
        }

        console.log(`[DEBUG] Fixed ${openingTags.length} unclosed tags`);
        return fixedContent;
    } catch (error) {
        console.error('[ERROR] Failed to fix unmatched tags:', error);
        return xmlContent; // Return original if fixing fails
    }
}

/**
 * Creates a minimal but valid document.xml with just the first page content
 */
function createMinimalDocumentXml(originalDocXml: string, firstPageXml: string): string {
    try {
        // The firstPageXml already contains the complete document structure from start to first page break
        // We just need to clean it and ensure it's properly closed

        // Remove page breaks
        let result = firstPageXml.replace(/<w:br[^>]*w:type="page"[^>]*\/>/g, '');

        // Extract section properties that appear after the first page break BEFORE fixing tags
        // These contain the header/footer references that are essential for display
        const pageBreakRegex = /<w:br[^>]*w:type="page"[^>]*\/>/g;
        const pages = originalDocXml.split(pageBreakRegex);

        let sectPrToAdd = null;
        if (pages.length > 1) {
            // Look for sectPr in the content immediately after the first page break
            const afterFirstPageBreak = pages[1];
            const sectPrMatch = afterFirstPageBreak?.match(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>/);
            if (sectPrMatch) {
                sectPrToAdd = sectPrMatch[0];
            }
        }
        console.log('[DEBUG] SectPr to add:', sectPrToAdd);

        // If no sectPr found after page break, look for any sectPr in the document
        if (!sectPrToAdd) {
            const generalSectPrMatch = originalDocXml.match(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>/);
            if (generalSectPrMatch) {
                sectPrToAdd = generalSectPrMatch[0];
            }
        }

        // Add section properties BEFORE fixing unmatched tags if they're missing
        if (sectPrToAdd && !result.includes('<w:sectPr')) {
            // Insert sectPr at the end of the body content, but before any closing tags
            if (result.includes('</w:body>')) {
                result = result.replace('</w:body>', `        ${sectPrToAdd}\n    </w:body>`);
            } else if (result.includes('</w:document>')) {
                result = result.replace('</w:document>', `        ${sectPrToAdd}\n</w:document>`);
            } else {
                // Add at the end if no closing tags found yet
                result += `\n        ${sectPrToAdd}`;
            }
            console.log('[DEBUG] Added sectPr to result');
        }

        // Fix any unmatched tags that might have been created by the page break split
        result = fixUnmatchedTags(result);

        // Ensure the document ends properly - add any missing closing tags
        if (result.includes('<w:body') && !result.includes('</w:body>')) {
            result += '\n    </w:body>';
        }

        if (result.includes('<w:document') && !result.includes('</w:document>')) {
            result += '\n</w:document>';
        }

        return result;
    } catch (error) {
        console.error('[ERROR] Failed to create document XML:', error);
        // Return the original with just page breaks removed as fallback
        return firstPageXml.replace(/<w:br[^>]*w:type="page"[^>]*\/>/g, '');
    }
}
