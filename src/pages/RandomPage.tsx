import React from 'react';
import QuestionDisplay from '@/components/QuestionDisplay';

export default function RandomPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <QuestionDisplay mode="random" />
    </div>
  );
}
