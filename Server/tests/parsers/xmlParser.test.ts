import { xmlParser } from '../../src/parsers/xmlParser';
import { ExamData } from '../../src/dataTypes/examData';
import ParserError from '../../src/utils/parserError';

describe('xmlParser', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <!-- question: 3699 -->
  <question type="multichoice">
    <n><text>Second Question</text></n>
    <questiontext format="html">
      <text><![CDATA[<p>What is 3 + 3?</p>
<p><img src="@@PLUGINFILE@@/img.png"></p>]]></text>
      <file name="img.png" path="/" encoding="base64">iVBORw0KGgoAAAANSUhEUg…</file>
    </questiontext>
    <defaultgrade>1</defaultgrade>
    <correctfeedback format="html">
      <text><![CDATA[<p>Your answer is correct.</p>]]></text>
    </correctfeedback>
    <incorrectfeedback format="html">
      <text><![CDATA[<p>Your answer is incorrect.</p>]]></text>
    </incorrectfeedback>
    <answer fraction="0"><text><![CDATA[5]]></text></answer>
    <answer fraction="100"><text><![CDATA[6]]></text></answer>
    <answer fraction="0"><text><![CDATA[4]]></text></answer>
  </question>
</quiz>`;

    it('parses a valid multichoice into an `examData` object and places the correct answer first', async () => {
        const exam = await xmlParser(xml);
        expect(exam.content).toHaveLength(1);

        const q = (exam.content[0] as any).question;
        expect(q.id).toBe(3699);
        expect(q.marks).toBe(1);

        // correct answer should come first
        expect(q.options[0]).toBe('6');
        expect(q.options.slice(1)).toEqual(['5', '4']);

        // HTML tags should be stripped from feedback
        expect(q.feedback.correctFeedback).toBe('Your answer is correct.');
        expect(q.feedback.incorrectFeedback).toBe('Your answer is incorrect.');

        // content: one HTML block, one image URI
        const htmls = q.content.filter((c: any) => 'questionText' in c);
        const imgs = q.content.filter((c: any) => 'imageUri' in c);
        
        expect(htmls).toHaveLength(1);
        // HTML tags should be stripped
        expect(htmls[0].questionText).toBe('What is 3 + 3?');
        // __type property should be set
        expect(htmls[0].__type).toBe('QuestionText');
        
        expect(imgs).toHaveLength(1);
        expect(imgs[0].imageUri).toMatch(/^data:image\/png;base64,/);
        expect(imgs[0].__type).toBe('ImageURI');
    });

    it('throws if multiple answers have fraction="100"', async () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <defaultgrade>1</defaultgrade>
          <correctfeedback><text><![CDATA[x]]></text></correctfeedback>
          <incorrectfeedback><text><![CDATA[y]]></text></incorrectfeedback>
          <answer fraction="100"><text><![CDATA[A]]></text></answer>
          <answer fraction="100"><text><![CDATA[B]]></text></answer>
          <answer fraction="100"><text><![CDATA[C]]></text></answer>
        </question>
      </quiz>`;
        
        await expect(xmlParser(xml)).rejects.toThrow(/multiple correct answers/i);
    });

    it('throws if no answer has fraction="100"', async () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <defaultgrade>1</defaultgrade>
          <correctfeedback><text><![CDATA[x]]></text></correctfeedback>
          <incorrectfeedback><text><![CDATA[y]]></text></incorrectfeedback>
          <answer fraction="0"><text><![CDATA[A]]></text></answer>
          <answer fraction="0"><text><![CDATA[B]]></text></answer>
          <answer fraction="0"><text><![CDATA[C]]></text></answer>
        </question>
      </quiz>`;
        
        await expect(xmlParser(xml)).rejects.toThrow(/no correct answer/i);
    });

    it('throws if there are fewer than three <answer> elements', async () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <defaultgrade>1</defaultgrade>
          <correctfeedback><text><![CDATA[x]]></text></correctfeedback>
          <incorrectfeedback><text><![CDATA[y]]></text></incorrectfeedback>
          <answer fraction="100"><text><![CDATA[Only]]></text></answer>
          <answer fraction="0"><text><![CDATA[One]]></text></answer>
        </question>
      </quiz>`;
        
        await expect(xmlParser(xml)).rejects.toThrow(/between 3 and 5/);
    });

    it('throws if there are more than five <answer> elements', async () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <defaultgrade>1</defaultgrade>
          <correctfeedback><text><![CDATA[x]]></text></correctfeedback>
          <incorrectfeedback><text><![CDATA[y]]></text></incorrectfeedback>
          <answer fraction="100"><text><![CDATA[A]]></text></answer>
          <answer fraction="0"><text><![CDATA[B]]></text></answer>
          <answer fraction="0"><text><![CDATA[C]]></text></answer>
          <answer fraction="0"><text><![CDATA[D]]></text></answer>
          <answer fraction="0"><text><![CDATA[E]]></text></answer>
          <answer fraction="0"><text><![CDATA[F]]></text></answer>
        </question>
      </quiz>`;
        
        await expect(xmlParser(xml)).rejects.toThrow(/between 3 and 5/);
    });
    
    it('throws if any mandatory field is missing in a multichoice', async () => {
        const base = `
    <quiz>
      <question type="multichoice">
        {{QTEXT}}
        {{GRADE}}
        {{CORRECTFB}}
        {{INCORRECTFB}}
        <answer fraction="100"><text><![CDATA[A]]></text></answer>
        <answer fraction="0"><text><![CDATA[B]]></text></answer>
        <answer fraction="0"><text><![CDATA[C]]></text></answer>
      </question>
    </quiz>`;
        const fields = [
            { key: 'QTEXT', tag: '<questiontext>', msg: /<questiontext>.*mandatory/i },
            { key: 'GRADE', tag: '<defaultgrade>', msg: /<defaultgrade>.*mandatory/i },
            { key: 'CORRECTFB', tag: '<correctfeedback>', msg: /<correctfeedback>.*mandatory/i },
            {
                key: 'INCORRECTFB',
                tag: '<incorrectfeedback>',
                msg: /<incorrectfeedback>.*mandatory/i,
            },
        ];

        for (const { key, msg } of fields) {
            const xml = base
                .replace(
                    '{{QTEXT}}',
                    key === 'QTEXT'
                        ? ''
                        : `<questiontext><text><![CDATA[q]]></text></questiontext>`,
                )
                .replace('{{GRADE}}', key === 'GRADE' ? '' : `<defaultgrade>1</defaultgrade>`)
                .replace(
                    '{{CORRECTFB}}',
                    key === 'CORRECTFB'
                        ? ''
                        : `<correctfeedback><text><![CDATA[x]]></text></correctfeedback>`,
                )
                .replace(
                    '{{INCORRECTFB}}',
                    key === 'INCORRECTFB'
                        ? ''
                        : `<incorrectfeedback><text><![CDATA[y]]></text></incorrectfeedback>`,
                );

            await expect(xmlParser(xml)).rejects.toThrow(msg);
        }
    });

    it('parses a description-type question into a Section with null questionCount', async () => {
        const xml = `
      <quiz>
        <!-- section: 42 -->
        <question type="description">
          <n><text>Intro Section</text></n>
          <questiontext format="html">
            <text><![CDATA[<p>Welcome to the exam.</p>]]></text>
          </questiontext>
        </question>
      </quiz>`;
        const exam = await xmlParser(xml);
        expect(exam.content).toHaveLength(1);

        const section = (exam.content[0] as any).section;
        expect(section.questionCount).toBeNull();
        expect(section.content).toHaveLength(1);

        const secText = section.content[0] as any;
        // HTML tags should be stripped
        expect(secText.sectionText).toBe('Welcome to the exam.');
        // __type property should be set
        expect(secText.__type).toBe('SectionText');
    });

    it('skips any question types except multichoice or description', async () => {
        const xml = `
      <quiz>
        <question type="truefalse">
          <questiontext><text><![CDATA[Yes or no?]]></text></questiontext>
        </question>
        <question type="essay">
          <questiontext><text><![CDATA[Write ten lines.]]></text></questiontext>
        </question>
      </quiz>`;
        const exam = await xmlParser(xml);
        expect(exam.content).toEqual([]);
    });
    
    it('strips HTML tags from content', async () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext format="html">
            <text><![CDATA[<p>This <strong>question</strong> has <em>formatting</em>.</p>]]></text>
          </questiontext>
          <defaultgrade>1</defaultgrade>
          <correctfeedback format="html">
            <text><![CDATA[<p>This is <strong>correct</strong>!</p>]]></text>
          </correctfeedback>
          <incorrectfeedback format="html">
            <text><![CDATA[<p>This is <strong>incorrect</strong>.</p>]]></text>
          </incorrectfeedback>
          <answer fraction="100"><text><![CDATA[<p>Correct <em>answer</em></p>]]></text></answer>
          <answer fraction="0"><text><![CDATA[<p>Wrong <strong>option</strong></p>]]></text></answer>
          <answer fraction="0"><text><![CDATA[<p>Another <span>wrong</span> option</p>]]></text></answer>
        </question>
      </quiz>`;
        
        const exam = await xmlParser(xml);
        const q = (exam.content[0] as any).question;
        
        // Question text should have HTML stripped
        const questionText = q.content.find((c: any) => c.__type === 'QuestionText');
        expect(questionText.questionText).toBe('This question has formatting.');
        
        // Feedback should have HTML stripped
        expect(q.feedback.correctFeedback).toBe('This is correct!');
        expect(q.feedback.incorrectFeedback).toBe('This is incorrect.');
        
        // Options should have HTML stripped
        expect(q.options[0]).toBe('Correct answer');
        expect(q.options[1]).toBe('Wrong option');
        expect(q.options[2]).toBe('Another wrong option');
    });
});
