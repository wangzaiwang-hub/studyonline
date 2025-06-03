import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseQuestions, generateQuestion } from '@/lib/question_generator';
import { WrongQuestionsManager } from '@/lib/wrong-questions-storage';

interface QuestionDisplayProps {
  mode?: 'random' | 'sequential' | 'review';
}

export default function QuestionDisplay({ mode = 'random' }: QuestionDisplayProps) {
  const navigate = useNavigate();
  const [question, setQuestion] = useState<{
    id: number;
    text: string;
    options: string[];
    correctAnswer: string;
    type?: string;
    correctAnswers?: string[];
  } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [currentButtonPage, setCurrentButtonPage] = useState(0);

  useEffect(() => {
    const loadedQuestions = parseQuestions();
    setQuestions(loadedQuestions);
    
    // 初始化第一个问题
    if (loadedQuestions.length > 0) {
      const initialQuestion = mode === 'sequential' 
        ? loadedQuestions[0] 
        : generateQuestion(loadedQuestions);
      setQuestion(initialQuestion);
    }
  }, [mode]);

  useEffect(() => {
    // 当currentIndex变化时更新按钮页面
    if (questions.length > 0) {
      const pageSize = 100;
      setCurrentButtonPage(Math.floor(currentIndex / pageSize));
    }
  }, [currentIndex, questions.length]);

  const handleNextQuestion = () => {
    if (questions.length > 0) {
      let nextQuestion;
      
      if (mode === 'sequential') {
        // 顺序模式
        const nextIndex = currentIndex + 1;
        if (nextIndex < questions.length) {
          nextQuestion = questions[nextIndex];
          setCurrentIndex(nextIndex);
        } else {
          // 已经是最后一题
          return;
        }
      } else {
        // 随机模式
        nextQuestion = generateQuestion(questions);
      }
      
      setQuestion(nextQuestion);
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setIsCorrect(null);
    }
  };

  const handlePrevQuestion = () => {
    if (mode === 'sequential' && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setQuestion(questions[prevIndex]);
      setCurrentIndex(prevIndex);
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setIsCorrect(null);
    }
  };

  const isMultipleChoice = question?.type === 'multiple';

  const handleAnswerSelect = (answer: string) => {
    if (isMultipleChoice) {
      // 多选题逻辑 - 允许选择多个选项
      if (isCorrect !== null) return; // 如果已经判断过，不允许再选择
      
      setSelectedAnswers(prev => {
        if (prev.includes(answer)) {
          // 如果已经选择了，则取消选择
          return prev.filter(a => a !== answer);
        } else {
          // 否则添加选择
          return [...prev, answer];
        }
      });
    } else {
      // 单选题逻辑
      if (isCorrect === null) {
        setSelectedAnswer(answer);
        const correctResult = answer === question?.correctAnswer;
        setIsCorrect(correctResult);

        // 如果选择错误，保存到错题集
        if (!correctResult && question) {
          WrongQuestionsManager.addWrongQuestion({
            ...question,
            wrongTimes: 1
          });
        }
      }
    }
  };

  const handleSubmitMultipleAnswers = () => {
    if (!isMultipleChoice || isCorrect !== null || !question) return;
    
    // 对多选题答案进行排序，以便比较
    const sortedSelected = [...selectedAnswers].sort();
    const sortedCorrect = [...(question.correctAnswers || [])].sort();
    
    // 检查是否完全匹配
    const isAnswerCorrect = 
      sortedSelected.length === sortedCorrect.length && 
      sortedSelected.every((value, index) => value === sortedCorrect[index]);
    
    setIsCorrect(isAnswerCorrect);

    // 如果选择错误，保存到错题集
    if (!isAnswerCorrect) {
      WrongQuestionsManager.addWrongQuestion({
        ...question,
        wrongTimes: 1
      });
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleToggleQuestionPanel = () => {
    setShowQuestionPanel(!showQuestionPanel);
  };

  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
      setQuestion(questions[index]);
      setSelectedAnswer(null);
      setSelectedAnswers([]);
      setIsCorrect(null);
      setShowQuestionPanel(false);
    }
  };

  // 生成题号分页按钮组
  const renderQuestionNumberButtons = () => {
    // 每页显示100个题号
    const pageSize = 100;
    const totalPages = Math.ceil(questions.length / pageSize);
    
    const handlePageChange = (newPage: number) => {
      if (newPage >= 0 && newPage < totalPages) {
        setCurrentButtonPage(newPage);
      }
    };

    const startIdx = currentButtonPage * pageSize;
    const endIdx = Math.min(startIdx + pageSize, questions.length);
    
    const buttons = [];
    for (let i = startIdx; i < endIdx; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handleJumpToQuestion(i)}
          className={`w-10 h-10 m-1 rounded-md text-sm ${
            i === currentIndex 
              ? 'bg-blue-500 text-white' 
              : 'bg-white border border-gray-300 hover:bg-gray-100'
          }`}
        >
          {i + 1}
        </button>
      );
    }
    
    return (
      <div>
        <div className="flex flex-wrap justify-center max-h-60 overflow-y-auto p-2">
          {buttons}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-2">
            <button 
              onClick={() => handlePageChange(currentButtonPage - 1)}
              disabled={currentButtonPage === 0}
              className="px-2 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
            >
              上一页
            </button>
            <span className="px-2 py-1">
              {currentButtonPage + 1} / {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentButtonPage + 1)}
              disabled={currentButtonPage === totalPages - 1}
              className="px-2 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!question) {
    return <div>加载题目中...</div>;
  }

  const getOptionClassName = (option: string) => {
    if (isMultipleChoice) {
      // 多选题样式
      if (isCorrect !== null) {
        // 已判断答案
        const isCorrectOption = question.correctAnswers?.includes(option);
        const isSelectedOption = selectedAnswers.includes(option);
        
        if (isCorrectOption) {
          return 'bg-green-500 text-white'; // 正确答案
        } else if (isSelectedOption) {
          return 'bg-red-500 text-white'; // 选择的错误答案
        }
      } else {
        // 未判断答案
        return selectedAnswers.includes(option)
          ? 'bg-blue-200 border border-blue-500' // 已选
          : 'bg-white border border-gray-300 hover:bg-gray-100'; // 未选
      }
    } else {
      // 单选题样式
      if (selectedAnswer !== null) {
        // 正确答案
        if (option === question.correctAnswer) {
          return 'bg-green-500 text-white';
        }
        
        // 选择的错误答案
        if (option === selectedAnswer && selectedAnswer !== question.correctAnswer) {
          return 'bg-red-500 text-white';
        }
      }
    }
    
    // 默认样式
    return 'bg-white border border-gray-300 hover:bg-gray-100';
  };

  // 移除题目中的页码和括号
  const displayText = question.text.replace(/（[^）]*）/, '（ ）').replace(/【[^】]*】/, '');

  return (
    <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
      {/* 顶部导航栏 */}
      <div className="flex items-center mb-6">
        <button 
          onClick={handleGoBack}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        {/* 进度显示 - 现在是可点击的 */}
        <button 
          onClick={handleToggleQuestionPanel}
          className="text-gray-600 hover:text-blue-500 font-medium px-2 py-1 rounded transition-colors"
        >
          {mode === 'sequential' 
            ? `${currentIndex + 1} / ${questions.length}` 
            : mode === 'random' 
              ? '随机刷题' 
              : '错题回顾'}
        </button>
      </div>

      {/* 题目序号选择面板 */}
      {showQuestionPanel && mode === 'sequential' && (
        <div className="mb-4 bg-gray-50 rounded-lg border border-gray-200 p-2">
          <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="text-sm font-semibold text-gray-700">选择题号</h3>
            <button 
              onClick={() => setShowQuestionPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {renderQuestionNumberButtons()}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">
          {displayText}
        </h2>
        
        {isMultipleChoice && (
          <div className="mb-2 text-sm text-blue-600 font-semibold">
            [多选题] 请选择所有正确选项
          </div>
        )}
        
        <div className="space-y-4">
          {['A', 'B', 'C', 'D'].map((label) => (
            <button
              key={label}
              onClick={() => handleAnswerSelect(label)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${getOptionClassName(label)}`}
            >
              {label}. {question.options[['A', 'B', 'C', 'D'].indexOf(label)]}
            </button>
          ))}
        </div>

        {/* 多选题提交按钮 */}
        {isMultipleChoice && isCorrect === null && (
          <button
            onClick={handleSubmitMultipleAnswers}
            className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            我选好了
          </button>
        )}

        {/* 答案解析 */}
        {((selectedAnswer && selectedAnswer !== question.correctAnswer) || 
          (isMultipleChoice && isCorrect === false)) && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-semibold text-green-700">
              正确答案：{isMultipleChoice && question.correctAnswers 
                ? question.correctAnswers.join(', ') 
                : `${question.correctAnswer}. ${question.options[['A', 'B', 'C', 'D'].indexOf(question.correctAnswer)]}`}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-6">
        {mode === 'sequential' && (
          <button 
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
            className={`px-4 py-2 rounded-lg ${currentIndex === 0 ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white'}`}
          >
            上一题
          </button>
        )}
        
        <button 
          onClick={handleNextQuestion}
          className="px-4 py-2 bg-green-500 text-white rounded-lg ml-auto"
        >
          {mode === 'sequential' && currentIndex === questions.length - 1 
            ? '完成' 
            : '下一题'}
        </button>
      </div>
    </div>
  );
} 