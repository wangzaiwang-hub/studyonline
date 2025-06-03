import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type Question = {
  id: number;
  question: string;
  options: string[];
  answer: number[];
  type: 'single' | 'multiple';
};

const mockQuestions: Question[] = [
  {
    id: 1,
    question: 'React是什么？',
    options: [
      'JavaScript库',
      'CSS框架',
      '编程语言',
      '数据库系统'
    ],
    answer: [0],
    type: 'single'
  },
  {
    id: 2,
    question: '下列哪些是React的特性？',
    options: [
      '虚拟DOM',
      '双向数据绑定',
      '组件化',
      '模板语法'
    ],
    answer: [0, 2],
    type: 'multiple'
  },
  {
    id: 3,
    question: 'React组件生命周期方法有哪些？',
    options: [
      'componentDidMount',
      'componentWillUnmount',
      'shouldComponentUpdate',
      'componentWillReceiveProps'
    ],
    answer: [0, 1, 2, 3],
    type: 'multiple'
  },
  {
    id: 4,
    question: 'React Hooks是什么时候引入的？',
    options: [
      'React 15',
      'React 16.8',
      'React 17',
      'React 18'
    ],
    answer: [1],
    type: 'single'
  },
  {
    id: 5,
    question: '下列哪些是合法的React Hook？',
    options: [
      'useState',
      'useEffect',
      'useContext',
      'useReducer'
    ],
    answer: [0, 1, 2, 3],
    type: 'multiple'
  }
];

export default function SequentialPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [wrongQuestions, setWrongQuestions] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // 从localStorage加载错题记录
    const storedWrongQuestions = localStorage.getItem('wrongQuestions');
    if (storedWrongQuestions) {
      setWrongQuestions(JSON.parse(storedWrongQuestions));
    }

    // 尝试恢复进度
    const storedProgress = localStorage.getItem('sequentialProgress');
    if (storedProgress) {
      setCurrentIndex(parseInt(storedProgress));
    }
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const handleOptionSelect = (optionIndex: number) => {
    if (currentQuestion.type === 'single') {
      setSelectedAnswers([optionIndex]);
    } else {
      if (selectedAnswers.includes(optionIndex)) {
        setSelectedAnswers(selectedAnswers.filter(i => i !== optionIndex));
      } else {
        setSelectedAnswers([...selectedAnswers, optionIndex]);
      }
    }
    setShowResult(false);
  };

  const checkAnswer = () => {
    let isCorrect = false;
    if (currentQuestion.type === 'single') {
      isCorrect = selectedAnswers.length === 1 && 
                 currentQuestion.answer.includes(selectedAnswers[0]);
    } else {
      // 多选题：完全正确才算正确（不能多选、漏选或错选）
      isCorrect = selectedAnswers.length === currentQuestion.answer.length &&
                 selectedAnswers.every(answer => currentQuestion.answer.includes(answer));
    }
    
    if (!isCorrect && !wrongQuestions.includes(currentQuestion.id)) {
      const updatedWrongQuestions = [...wrongQuestions, currentQuestion.id];
      setWrongQuestions(updatedWrongQuestions);
      localStorage.setItem('wrongQuestions', JSON.stringify(updatedWrongQuestions));
    }
    
    setShowResult(true);
    return isCorrect;
  };

  const handleSubmitAnswer = () => {
    checkAnswer();
  };

  const goToNextQuestion = () => {
    if (!isLastQuestion) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      localStorage.setItem('sequentialProgress', newIndex.toString());
      setSelectedAnswers([]);
      setShowResult(false);
    }
  };

  const goToPrevQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswers([]);
      setShowResult(false);
    }
  };

  const isOptionSelected = (optionIndex: number) => {
    return selectedAnswers.includes(optionIndex);
  };

  const isOptionCorrect = (optionIndex: number) => {
    return currentQuestion.answer.includes(optionIndex);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      {/* 顶部导航栏 */}
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
        <button 
          onClick={() => navigate('/')}
          className="text-[#333333]"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="text-[#333333]">
          {currentIndex + 1}/{questions.length}
        </div>
      </div>

      {/* 题目区域 */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-lg font-bold text-[#333333] mb-6">
            {currentQuestion.question}
          </h2>
          
          {/* 选项列表 */}
          <div className="space-y-3">
             {currentQuestion.options.map((option, index) => {
               const isSelected = isOptionSelected(index);
               const isCorrect = isOptionCorrect(index);
               
               return (
                 <motion.div
                   key={index}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => handleOptionSelect(index)}
                   className={`
                     p-3 border rounded-lg cursor-pointer
                     ${isSelected && !showResult ? 'border-[#87CEEB] bg-[#87CEEB]/10' : ''}
                     ${showResult && isCorrect ? 'border-[#4CAF50] bg-[#4CAF50]/10' : ''}
                     ${showResult && isSelected && !isCorrect ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' : ''}
                     ${!isSelected && !showResult ? 'border-[#E0E0E0]' : ''}
                   `}
                 >
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full border flex items-center justify-center mr-3">
                      {showResult && isCorrect && (
                        <i className="fa-solid fa-check text-[#4CAF50]"></i>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <i className="fa-solid fa-xmark text-[#FF6B6B]"></i>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部控制按钮 */}
       <div className="flex justify-between p-4 bg-white border-t">
         <button
           onClick={goToPrevQuestion}
           disabled={isFirstQuestion}
           className={`px-6 py-2 rounded-lg ${isFirstQuestion ? 'bg-gray-200 text-gray-500' : 'bg-[#98FF98] text-white'}`}
         >
           上一题
         </button>
         
         {selectedAnswers.length > 0 && !showResult && (
           <button
             onClick={handleSubmitAnswer}
             className="px-6 py-2 bg-[#FF7F50] text-white rounded-lg font-medium"
           >
             提交答案
           </button>
         )}
         
         <button
           onClick={goToNextQuestion}
           className={`px-6 py-2 rounded-lg ${isLastQuestion ? 'bg-[#FF7F50]' : 'bg-[#87CEEB]'} text-white`}
         >
           {isLastQuestion ? '完成' : '下一题'}
         </button>
       </div>
    </div>
  );
}
