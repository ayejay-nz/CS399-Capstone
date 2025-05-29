import JSZip from "jszip";
import ApiError from '../utils/apiError';
import { HTTP_STATUS_CODE, API_ERROR_MESSAGE, API_ERROR_CODE } from '../constants/constants';
import { parseStringPromise } from "xml2js";
import { ImageURI, TableURI } from '../dataTypes/examData';
import { AppendixPage, AppendixText } from '../dataTypes/coverpage';

/**
 * Process an image element and add it to pieces, flushing any accumulated text first
 */
async function processImage(
  element: string,
  buffer: string,
  pieces: (AppendixText | ImageURI | TableURI)[],
  imageMap: Map<string, string>,
  zip: JSZip
): Promise<string> {
  const imageMatch = element.match(/r:embed="([^"]*)"/);
  if (imageMatch) {
    const rId = imageMatch[1];
    if (rId && imageMap.has(rId)) {
      // Add any accumulated text before the image
      if (buffer.trim()) {
        pieces.push({ __type: 'AppendixText', appendixText: buffer.trim() } as AppendixText);
      }
      // Add the image
      const imgPath = imageMap.get(rId)!;
      const data = await zip.file(imgPath)!.async("base64");
      pieces.push({ imageUri: `data:image/png;base64,${data}`, __type: "ImageURI" } as ImageURI);
      
      // Return empty buffer since we flushed it
      return '';
    }
  }
  // Return original buffer if image processing failed
  return buffer;
}

/**
 * Process a text element and add its content to the buffer
 */
function processText(element: string, buffer: string): string {
  const textMatch = element.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
  if (textMatch) {
    return buffer + (textMatch[1] || '');
  }
  return buffer;
}

/**
 * Process a line break element and add it to the buffer
 */
function processLineBreak(buffer: string): string {
  return buffer + '\n';
}

/**
 * Add accumulated text buffer to pieces if it contains content
 */
function flushTextBuffer(buffer: string, pieces: (AppendixText | ImageURI | TableURI)[]): string {
  if (buffer.trim()) {
    pieces.push({ __type: 'AppendixText', appendixText: buffer.trim() } as AppendixText);
  }
  return '';
}

export async function parseAppendicePage(file: Buffer | Blob, xmlContent?: string): Promise<AppendixPage> {
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
    let xml = xmlContent ?? await zip.file("word/document.xml")?.async("text");
    if (!xml) throw new Error("Could not find document.xml in docx");

    type Piece = AppendixText | ImageURI | TableURI;
    const pieces: Piece[] = [];

    // Capture all XML elements in document order: paragraphs, tables, runs, text, line breaks, images
    const elementMatches = xml.matchAll(/<w:p[\s\S]*?<\/w:p>|<w:tbl[\s\S]*?<\/w:tbl>|<w:r[\s\S]+?<\/w:r>|<w:t[^>]*>[^<]*<\/w:t>|<w:br[^>]*\/>|<a:blip[^>]*r:embed="[^"]*"[^>]*\/>/g);
    
    let buffer = '';
    
    for (const elementMatch of elementMatches) {
      const element = elementMatch[0];
      
      if (element.startsWith('<w:tbl')) {
        // Table - add any accumulated text first, then add table
        buffer = flushTextBuffer(buffer, pieces);
        pieces.push({
          tableUri: element,
          __type: "TableURI",
        } as TableURI);
        
      } else if (element.startsWith('<w:p')) {
        // Complete paragraph - process its runs inline
        const runMatches = element.matchAll(/<w:r[\s\S]*?<\/w:r>/g);
        
        for (const runMatch of runMatches) {
          const run = runMatch[0];
          
          // Process run content in order (text, line breaks, images)
          const runContent = run.match(/<w:t[^>]*>[^<]*<\/w:t>|<w:br[^>]*\/>|<a:blip[^>]*r:embed="[^"]*"[^>]*\/>/g) || [];
          
          for (const item of runContent) {
            if (item.includes('<w:br')) {
              buffer = processLineBreak(buffer);
            } else if (item.includes('<a:blip')) {
              buffer = await processImage(item, buffer, pieces, imageMap, zip);
            } else if (item.includes('<w:t')) {
              buffer = processText(item, buffer);
            }
          }
        }
      } else if (element.startsWith('<w:r')) {
        // Standalone run (from incomplete paragraph) -- process its content
        const runContent = element.match(/<w:t[^>]*>[^<]*<\/w:t>|<w:br[^>]*\/>|<a:blip[^>]*r:embed="[^"]*"[^>]*\/>/g) || [];
        
        for (const item of runContent) {
          if (item.includes('<w:br')) {
            buffer = processLineBreak(buffer);
          } else if (item.includes('<a:blip')) {
            buffer = await processImage(item, buffer, pieces, imageMap, zip);
          } else if (item.includes('<w:t')) {
            buffer = processText(item, buffer);
          }
        }
        
      } else if (element.includes('<w:br')) {
        // Standalone line break
        buffer = processLineBreak(buffer);        
      } else if (element.includes('<a:blip')) {
        // Standalone image
        buffer = await processImage(element, buffer, pieces, imageMap, zip);
      } else if (element.includes('<w:t')) {
        // Standalone text element
        buffer = processText(element, buffer);
      }
    }
    
    // Add any remaining text
    flushTextBuffer(buffer, pieces);

    return {
      appendix: {
        isUploaded: true,
        content: pieces
      }
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
