import React from 'react';
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">毛概刷题系统</h1>
        <h2 className="text-2xl font-bold text-center mb-6">宝宝加油</h2>
        <div className="space-y-4">
          <Link 
            to="/sequential" 
            className="block w-full bg-blue-500 text-white py-3 text-center rounded-md hover:bg-blue-600 transition"
          >
            顺序刷题
          </Link>
          <Link 
            to="/random" 
            className="block w-full bg-green-500 text-white py-3 text-center rounded-md hover:bg-green-600 transition"
          >
            随机刷题
          </Link>
          <Link 
            to="/review" 
            className="block w-full bg-yellow-500 text-white py-3 text-center rounded-md hover:bg-yellow-600 transition"
          >
            错题回顾
          </Link>
            <Link
            to="/wrong-questions" 
            className="block w-full bg-purple-500 text-white py-3 text-center rounded-md hover:bg-purple-600 transition"
            >
            错题集
            </Link>
        </div>
      </div>
    </div>
  );
}