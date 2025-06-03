import React from 'react';
import QuestionDisplay from '@/components/QuestionDisplay';

export default function SequentialPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <QuestionDisplay mode="sequential" />
    </div>
  );
}
