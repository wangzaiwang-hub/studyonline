import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type Question = {
  id: number;
  question: string;
  options: string[];
  answer: number[];
  type: 'single' | 'multiple';
  wrongTimes: number;
};

export default function ReviewPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  
  // 从localStorage加载错题
  useEffect(() => {
    try {
      const storedWrongQuestions = localStorage.getItem('wrongQuestions');
      if (storedWrongQuestions) {
        const wrongIds = JSON.parse(storedWrongQuestions);
        const allQuestions = [
          // 这里添加所有题目数据，或者从其他地方获取
          {
            id: 1,
            question: 'React是什么？',
            options: ['JavaScript库', 'CSS框架', '编程语言', '数据库系统'],
            answer: [0],
            type: 'single'
          },
          // 添加其他题目...
        ];
        
        // 统计错题次数并构建错题集
        const wrongQuestionsMap = new Map<number, number>();
        wrongIds.forEach((id: number) => {
          wrongQuestionsMap.set(id, (wrongQuestionsMap.get(id) || 0) + 1);
        });

        const reviewQuestions = allQuestions
          .filter((q: Question) => wrongQuestionsMap.has(q.id))
          .map((q: Question) => ({
            ...q,
            wrongTimes: wrongQuestionsMap.get(q.id) || 1
          }));

        setQuestions(reviewQuestions);

        // 尝试恢复错题复习进度
        const storedReviewProgress = localStorage.getItem('reviewProgress');
        if (storedReviewProgress) {
          setCurrentIndex(parseInt(storedReviewProgress));
        }
      }
    } catch (error) {
      console.error('加载错题时出错:', error);
    }
  }, []);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const handleOptionSelect = (optionIndex: number) => {
    if (currentQuestion?.type === 'single') {
      setSelectedAnswers([optionIndex]);
    } else {
      if (selectedAnswers.includes(optionIndex)) {
        setSelectedAnswers(selectedAnswers.filter(i => i !== optionIndex));
      } else {
        setSelectedAnswers([...selectedAnswers, optionIndex]);
      }
    }
  };

  const removeCurrentQuestion = () => {
    if (!currentQuestion) return;

    // 从localStorage中移除当前错题
    const storedWrongQuestions = localStorage.getItem('wrongQuestions');
    if (storedWrongQuestions) {
      const wrongIds = JSON.parse(storedWrongQuestions);
      const updatedWrongIds = wrongIds.filter((id: number) => id !== currentQuestion.id);
      localStorage.setItem('wrongQuestions', JSON.stringify(updatedWrongIds));
    }

    // 更新本地状态
    const updatedQuestions = questions.filter(q => q.id !== currentQuestion.id);
    setQuestions(updatedQuestions);
    
    // 如果移除后没有题目了，返回首页
    if (updatedQuestions.length === 0) {
      navigate('/');
    } else {
      // 调整当前索引
      setCurrentIndex(Math.min(currentIndex, updatedQuestions.length - 1));
      setSelectedAnswers([]);
    }
  };

  const goToNextQuestion = () => {
    if (!isLastQuestion) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      localStorage.setItem('reviewProgress', newIndex.toString());
      setSelectedAnswers([]);
    } else {
      // 如果是最后一题，回到第一题
      setCurrentIndex(0);
      localStorage.setItem('reviewProgress', '0');
      setSelectedAnswers([]);
    }
  };

  const isOptionSelected = (optionIndex: number) => {
    return selectedAnswers.includes(optionIndex);
  };

  const isOptionCorrect = (optionIndex: number) => {
    return currentQuestion?.answer.includes(optionIndex);
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F6] p-4">
        <div className="text-center">
          <i className="fa-solid fa-check-circle text-5xl text-[#4CAF50] mb-4"></i>
          <h2 className="text-xl font-bold text-[#333333] mb-2">没有错题需要复习</h2>
          <p className="text-gray-500 mb-6">继续保持！</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#87CEEB] text-white rounded-lg font-medium"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF9F6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#87CEEB] mb-4"></div>
          <p className="text-[#333333]">题目加载中...</p>
        </div>
      </div>
    );
  }

  const showResult = selectedAnswers.length > 0;

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
        <div className="flex items-center">
          <span className="text-[#333333] mr-2">
            {currentIndex + 1}/{questions.length}
          </span>
          <span className="bg-[#FF6B6B] text-white text-xs px-2 py-1 rounded-full">
            错 {currentQuestion.wrongTimes} 次
          </span>
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
          onClick={removeCurrentQuestion}
          className="px-6 py-2 bg-[#98FF98] text-white rounded-lg font-medium"
        >
          移除错题
        </button>
        <button
          onClick={goToNextQuestion}
          className="px-6 py-2 bg-[#87CEEB] text-white rounded-lg font-medium"
        >
          下一题
        </button>
      </div>
    </div>
  );
}
