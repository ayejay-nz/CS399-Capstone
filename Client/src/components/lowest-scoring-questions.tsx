import { Progress } from "../components/ui/progress";

const questions = [
  {
    id: "Q1",
    text: "What decimal number is equivalent to the binary number 1110112?",
    percentage: 45,
  },
  {
    id: "Q2",
    text: "How much memory is required to represent an image that is 8 pixels high and 3 pixels wide and uses 8 colours?",
    percentage: 53,
  },
  {
    id: "Q3",
    text: "What is the ASCII code for the word 'READ'?",
    percentage: 61,
  },
  {
    id: "Q4",
    text: "Which of the following prefixes is the largest?",
    percentage: 71,
  },
  {
    id: "Q5",
    text: "Software that you can download for free, but have to pay to continue to use after a trial period is what kind of software?",
    percentage: 74,
  },
];

export function LowestScoringQuestions() {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">
            Lowest Scoring Questions
          </h3>
          <span className="text-sm text-gray-400">
            Student’s correct %
          </span>
        </div>
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              {/* question + % */}
              <div className="flex justify-between items-start">
                {/* give the text flex-1 and some right padding */}
                <p className="text-sm flex-1 pr-4 text-white">
                  {q.id}. {q.text}
                </p>
                <span className="text-sm font-medium text-white">
                  {q.percentage}%
                </span>
              </div>
  
              {/* custom-styled progress */}
              <Progress
                value={q.percentage}
                className="
                  h-1 
                  bg-[#27272A]       /* dark track */
                  rounded-full
                  [&_div]:bg-white   /* force the inner bar white */
                "
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
