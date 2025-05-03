import { xmlParser } from '../../src/parsers/xmlParser';
import { ExamData } from '../../src/dataTypes/examData';

describe('xmlParser', () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <!-- question: 3699  -->
  <question type="multichoice">
    <name><text>Second Question</text></name>
    <questiontext format="html">
      <text><![CDATA[<p>What is 3 + 3?</p>
<p><img class="img-fluid" src="@@PLUGINFILE@@/Group%2029.png" alt="two arrows"></p>]]></text>
      <file name="Group 29.png" path="/" encoding="base64">iVBORw0KG…</file>
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

    it('parses a valid multichoice question into an ExamData object', () => {
        const exam = xmlParser(sampleXml) as ExamData;
        expect(exam.content).toHaveLength(1);

        const { question: q } = (exam.content[0] as any).question;

        expect(q.id).toBe(3699);
        expect(q.marks).toBe(1);
        expect(q.feedback.correctFeedback).toBe('<p>Your answer is correct.</p>');
        expect(q.feedback.incorrectFeedback).toBe('<p>Your answer is incorrect.</p>');

        // correct answer always comes first
        expect(q.options[0]).toBe('6');
        expect(q.options.slice(1)).toEqual(['5', '4']);

        // content contains one HTML block and one image URI
        const htmls = q.content.filter((c: any) => 'questionText' in c);
        const imgs = q.content.filter((c: any) => 'imageUri' in c);
        expect(htmls).toHaveLength(1);
        expect(htmls[0].questionText).toContain('What is 3 + 3?');
        expect(imgs).toHaveLength(1);
        expect(imgs[0].imageUri).toMatch(/^data:image\/png;base64,/);
    });

    it('throws if more than one answer has fraction="100"', () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <defaultgrade>1</defaultgrade>
          <correctfeedback><text><![CDATA[ok]]></text></correctfeedback>
          <incorrectfeedback><text><![CDATA[no]]></text></incorrectfeedback>
          <answer fraction="100"><text><![CDATA[A]]></text></answer>
          <answer fraction="100"><text><![CDATA[B]]></text></answer>
        </question>
      </quiz>`;
        expect(() => xmlParser(xml)).toThrow(/multiple correct answers/i);
    });

    it('throws if no answer has fraction="100"', () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <defaultgrade>1</defaultgrade>
          <correctfeedback><text><![CDATA[ok]]></text></correctfeedback>
          <incorrectfeedback><text><![CDATA[no]]></text></incorrectfeedback>
          <answer fraction="0"><text><![CDATA[A]]></text></answer>
          <answer fraction="0"><text><![CDATA[B]]></text></answer>
        </question>
      </quiz>`;
        expect(() => xmlParser(xml)).toThrow(/no correct answer/i);
    });

    it('skips questions that are not type="multichoice"', () => {
        const xml = `
      <quiz>
        <question type="description">
          <questiontext><text><![CDATA[info]]></text></questiontext>
        </question>
        <question type="truefalse">
          <questiontext><text><![CDATA[yes/no]]></text></questiontext>
        </question>
      </quiz>`;
        const exam = xmlParser(xml) as ExamData;
        expect(exam.content).toHaveLength(0);
    });

    // new mandatory-fields tests

    it('throws if <questiontext> is missing', () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <defaultgrade>1</defaultgrade>
          <correctfeedback><text><![CDATA[ok]]></text></correctfeedback>
          <incorrectfeedback><text><![CDATA[no]]></text></incorrectfeedback>
          <answer fraction="100"><text><![CDATA[A]]></text></answer>
        </question>
      </quiz>`;
        expect(() => xmlParser(xml)).toThrow(/<questiontext>.*mandatory/i);
    });

    it('throws if <defaultgrade> is missing', () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <correctfeedback><text><![CDATA[ok]]></text></correctfeedback>
          <incorrectfeedback><text><![CDATA[no]]></text></incorrectfeedback>
          <answer fraction="100"><text><![CDATA[A]]></text></answer>
        </question>
      </quiz>`;
        expect(() => xmlParser(xml)).toThrow(/<defaultgrade>.*mandatory/i);
    });

    it('throws if <correctfeedback> is missing', () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <defaultgrade>1</defaultgrade>
          <incorrectfeedback><text><![CDATA[no]]></text></incorrectfeedback>
          <answer fraction="100"><text><![CDATA[A]]></text></answer>
        </question>
      </quiz>`;
        expect(() => xmlParser(xml)).toThrow(/<correctfeedback>.*mandatory/i);
    });

    it('throws if <incorrectfeedback> is missing', () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <defaultgrade>1</defaultgrade>
          <correctfeedback><text><![CDATA[ok]]></text></correctfeedback>
          <answer fraction="100"><text><![CDATA[A]]></text></answer>
        </question>
      </quiz>`;
        expect(() => xmlParser(xml)).toThrow(/<incorrectfeedback>.*mandatory/i);
    });

    it('throws if there are no <answer> elements at all', () => {
        const xml = `
      <quiz>
        <question type="multichoice">
          <questiontext><text><![CDATA[q]]></text></questiontext>
          <defaultgrade>1</defaultgrade>
          <correctfeedback><text><![CDATA[ok]]></text></correctfeedback>
          <incorrectfeedback><text><![CDATA[no]]></text></incorrectfeedback>
        </question>
      </quiz>`;
        expect(() => xmlParser(xml)).toThrow(/at least one <answer>.*mandatory/i);
    });
});
