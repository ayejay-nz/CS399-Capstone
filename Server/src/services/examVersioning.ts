import { DEFAULT_EXAM_VERSIONS } from '../constants/constants';
import { ExamData, Question, Section } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { padTo8 } from '../utils/format';
import { generateOptionOrder } from '../utils/shuffle';

function isSection(contentBlock: Question | Section) {
    return 'section' in contentBlock;
}

// Creates DEFAULT_EXAM_VERSIONS amount of empty exams
function initialiseEmptyExams() {
    return Array.from(
        { length: DEFAULT_EXAM_VERSIONS },
        (_, v) =>
            ({
                versionNumber: padTo8(v + 1),
                optionOrder: [],
            }) as VersionedExam,
    );
}

export function randomiseOptionOrder(examData: ExamData) {
    let examVersions = initialiseEmptyExams();

    examData.content.forEach((contentBlock) => {
        if (isSection(contentBlock)) {
            return; // Skip sections
        }

        const optionCount = contentBlock.question.options.length;
        // Create randomised option orders for each version
        for (let i = 0; i < DEFAULT_EXAM_VERSIONS; i++) {
            const optionOrder = generateOptionOrder(optionCount);
            examVersions[i]!.optionOrder.push(optionOrder);
        }
    });

    return examVersions;
}
