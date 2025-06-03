import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WrongQuestionsManager } from '@/lib/wrong-questions-storage';

export default function WrongQuestionsPage() {
  const navigate = useNavigate();
  const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);

  useEffect(() => {
    const questions = WrongQuestionsManager.getWrongQuestions();
    setWrongQuestions(questions);
  }, []);

  const handleRemoveQuestion = (questionId: number) => {
    WrongQuestionsManager.removeWrongQuestion(questionId);
    const updatedQuestions = wrongQuestions.filter(q => q.id !== questionId);
    setWrongQuestions(updatedQuestions);
  };

  const handleClearAll = () => {
    WrongQuestionsManager.clearWrongQuestions();
    setWrongQuestions([]);
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
        {/* 顶部导航栏 */}
        <div className="flex justify-between items-center p-4 border-b">
          <button 
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <h2 className="text-xl font-bold">错题集</h2>
          
          {wrongQuestions.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700"
            >
              清空
            </button>
          )}
        </div>

        {/* 错题列表 */}
        {wrongQuestions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            暂无错题
          </div>
        ) : (
          <div className="divide-y">
            {wrongQuestions.map((question) => (
              <div key={question.id} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700">
                    错误次数：{question.wrongTimes}
                  </span>
                  <button 
                    onClick={() => handleRemoveQuestion(question.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    移除
                  </button>
                </div>
                <p className="text-gray-800 mb-2">{question.text}</p>
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((label, index) => (
                    <div 
                      key={label} 
                      className={`p-2 rounded ${
                        label === question.correctAnswer 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {label}. {question.options[index]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 