import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Question = {
  id: number;
  question: string;
  options: string[];
  answer: number[];
  type: 'single' | 'multiple';
};

type Result = {
  correctRate: number;
  timeSpent: string;
  singleChoiceRate: number;
  multipleChoiceRate: number;
};

const allQuestions: Question[] = [
  {
    id: 1,
    question: 'React是什么？',
    options: ['JavaScript库', 'CSS框架', '编程语言', '数据库系统'],
    answer: [0],
    type: 'single'
  },
  {
    id: 2,
    question: '下列哪些是React的特性？',
    options: ['虚拟DOM', '双向数据绑定', '组件化', '模板语法'],
    answer: [0, 2],
    type: 'multiple'
  },
  {
    id: 3,
    question: 'React组件生命周期方法有哪些？',
    options: ['componentDidMount', 'componentWillUnmount', 'shouldComponentUpdate', 'componentWillReceiveProps'],
    answer: [0, 1, 2, 3],
    type: 'multiple'
  },
  {
    id: 4,
    question: 'React Hooks是什么时候引入的？',
    options: ['React 15', 'React 16.8', 'React 17', 'React 18'],
    answer: [1],
    type: 'single'
  },
  {
    id: 5,
    question: '下列哪些是合法的React Hook？',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    answer: [0, 1, 2, 3],
    type: 'multiple'
  },
  {
    id: 6,
    question: 'useEffect的第二个参数是什么？',
    options: ['依赖数组', '回调函数', '初始值', '配置对象'],
    answer: [0],
    type: 'single'
  },
  {
    id: 7,
    question: '下列哪些是React的内置组件？',
    options: ['Fragment', 'Suspense', 'ErrorBoundary', 'Context'],
    answer: [0, 1],
    type: 'multiple'
  },
  {
    id: 8,
    question: 'React中key的作用是什么？',
    options: ['提高渲染性能', '组件唯一标识', '样式控制', '状态管理'],
    answer: [0, 1],
    type: 'multiple'
  },
  {
    id: 9,
    question: 'React Router的主要组件有哪些？',
    options: ['BrowserRouter', 'Route', 'Link', 'Switch'],
    answer: [0, 1, 2],
    type: 'multiple'
  },
  {
    id: 10,
    question: 'React中状态提升是指什么？',
    options: ['将状态提升到父组件', '使用全局状态', '使用Context', '使用Redux'],
    answer: [0],
    type: 'single'
  }
];

export default function RandomPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [wrongQuestions, setWrongQuestions] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [stats, setStats] = useState({
    correct: 0,
    singleCorrect: 0,
    multipleCorrect: 0,
    singleTotal: 0,
    multipleTotal: 0
  });

  // 初始化随机题目
  useEffect(() => {
    const storedWrongQuestions = localStorage.getItem('wrongQuestions');
    if (storedWrongQuestions) {
      setWrongQuestions(JSON.parse(storedWrongQuestions));
    }

    // 尝试恢复进度
    const storedProgress = localStorage.getItem('randomProgress');
    if (storedProgress) {
      setCurrentIndex(parseInt(storedProgress));
    }

    // 随机选择15道单选和15道多选
    const singleChoice = allQuestions
      .filter(q => q.type === 'single')
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);
    
    const multipleChoice = allQuestions
      .filter(q => q.type === 'multiple')
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);

    setQuestions([...singleChoice, ...multipleChoice].sort(() => 0.5 - Math.random()));
    setStartTime(new Date());
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

  const handleSubmitAnswer = () => {
    if (currentQuestion?.type === 'multiple' && selectedAnswers.length > 0) {
      checkAnswer();
    }
  };

  const checkAnswer = useCallback(() => {
    if (!currentQuestion) return false;

    let isCorrect = false;
    if (currentQuestion.type === 'single') {
      isCorrect = selectedAnswers.length === 1 && 
                 currentQuestion.answer.includes(selectedAnswers[0]);
    } else {
      // 多选题：完全正确才算正确（不能多选、漏选或错选）
      isCorrect = selectedAnswers.length === currentQuestion.answer.length &&
                 selectedAnswers.every(answer => currentQuestion.answer.includes(answer));
    }
    
    // 更新统计
    setStats(prev => {
      const newStats = {...prev};
      if (currentQuestion.type === 'single') {
        newStats.singleTotal += 1;
        if (isCorrect) newStats.singleCorrect += 1;
      } else {
        newStats.multipleTotal += 1;
        if (isCorrect) newStats.multipleCorrect += 1;
      }
      if (isCorrect) newStats.correct += 1;
      return newStats;
    });

    // 记录错题（单选题选错、多选题选错或漏选）
    if (!isCorrect && currentQuestion.id && !wrongQuestions.includes(currentQuestion.id)) {
      const updatedWrongQuestions = [...wrongQuestions, currentQuestion.id];
      setWrongQuestions(updatedWrongQuestions);
      localStorage.setItem('wrongQuestions', JSON.stringify(updatedWrongQuestions));
    }

    return isCorrect;
  }, [currentQuestion, selectedAnswers, wrongQuestions]);

  const goToNextQuestion = () => {
    checkAnswer();
    if (!isLastQuestion) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      localStorage.setItem('randomProgress', newIndex.toString());
      setSelectedAnswers([]);
    } else {
      // 计算最终结果
      const endTime = new Date();
      const timeDiff = endTime.getTime() - (startTime?.getTime() || endTime.getTime());
      const minutes = Math.floor(timeDiff / 60000);
      const seconds = ((timeDiff % 60000) / 1000).toFixed(0);
      
      setResult({
        correctRate: Math.round((stats.correct / questions.length) * 100),
        timeSpent: `${minutes}分${seconds}秒`,
        singleChoiceRate: stats.singleTotal > 0 
          ? Math.round((stats.singleCorrect / stats.singleTotal) * 100)
          : 0,
        multipleChoiceRate: stats.multipleTotal > 0
          ? Math.round((stats.multipleCorrect / stats.multipleTotal) * 100)
          : 0
      });
    }
  };

  const goToPrevQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswers([]);
    }
  };

  const isOptionSelected = (optionIndex: number) => {
    return selectedAnswers.includes(optionIndex);
  };

  const isOptionCorrect = (optionIndex: number) => {
    return currentQuestion?.answer.includes(optionIndex);
  };

  const chartData = [
    { name: '单选题', rate: result?.singleChoiceRate || 0 },
    { name: '多选题', rate: result?.multipleChoiceRate || 0 }
  ];

  if (result) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF9F6] p-4">
        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm mb-4">
          <button 
            onClick={() => navigate('/')}
            className="text-[#333333]"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-lg font-bold text-[#333333]">答题结果</h2>
          <div className="w-6"></div> {/* 占位 */}
        </div>

        {/* 统计面板 */}
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#FAF9F6] p-4 rounded-lg">
              <div className="text-sm text-gray-500">正确率</div>
              <div className="text-3xl font-bold text-[#FF7F50]">{result.correctRate}%</div>
            </div>
            <div className="bg-[#FAF9F6] p-4 rounded-lg">
              <div className="text-sm text-gray-500">用时</div>
              <div className="text-3xl font-bold text-[#333333]">{result.timeSpent}</div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, '正确率']} />
                <Bar dataKey="rate" fill="#FF7F50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 bg-[#87CEEB] text-white rounded-lg font-medium"
        >
          返回首页
        </button>
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

  const showResult = currentQuestion?.type === 'single' ? selectedAnswers.length > 0 : false;
  const showSubmitButton = currentQuestion?.type === 'multiple' && selectedAnswers.length > 0 && !showResult;


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
                     ${isSelected ? 'border-[#87CEEB] bg-[#87CEEB]/10' : 'border-[#E0E0E0]'}
                     ${showResult && isCorrect ? 'border-[#4CAF50] bg-[#4CAF50]/10' : ''}
                     ${showResult && isSelected && !isCorrect ? 'border-[#FF6B6B] bg-[#FF6B6B]/10' : ''}
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
        
        {showSubmitButton && (
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
