import questionsData from './questions.json';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

// 硬编码题目数据，避免使用文件系统
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "给中国送来了马克思列宁主义，给苦苦探寻救亡图存出路的中国人民指明了前进方向、提供了全新选择",
    options: [
      "鸦片战争",
      "新文化运动", 
      "五四运动", 
      "十月革命"
    ],
    correctAnswer: "D"
  },
  {
    id: 2,
    text: "1921年中国共产党诞生后，成为中国共产党人的重大时代课题",
    options: [
      "领导工人运动",
      "遵循马克思列宁主义", 
      "马克思主义中国化时代化", 
      "领导中国革命"
    ],
    correctAnswer: "C"
  }
  // 可以继续添加更多题目
];

export function parseQuestions(): Question[] {
  return questionsData.questions;
}

export function generateQuestion(questions: Question[]): Question {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

export function formatQuestionForDisplay(question: Question): string {
  const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
  
  const optionsText = shuffledOptions.map((option, index) => 
    `${String.fromCharCode(65 + index)}. ${option}`
  ).join('\n');
  
  return `题目：${question.text}\n\n${optionsText}`;
} 