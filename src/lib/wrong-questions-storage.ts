interface WrongQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  wrongTimes: number;
}

export class WrongQuestionsManager {
  private static STORAGE_KEY = 'wrong-questions';

  static addWrongQuestion(question: WrongQuestion) {
    const wrongQuestions = this.getWrongQuestions();
    
    // 检查是否已存在该题目
    const existingQuestionIndex = wrongQuestions.findIndex(q => q.id === question.id);
    
    if (existingQuestionIndex !== -1) {
      // 如果题目已存在，增加错误次数
      wrongQuestions[existingQuestionIndex].wrongTimes += 1;
    } else {
      // 如果是新的错题，添加到列表
      wrongQuestions.push({
        ...question,
        wrongTimes: 1
      });
    }

    // 保存到本地存储
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(wrongQuestions));
  }

  static getWrongQuestions(): WrongQuestion[] {
    const storedQuestions = localStorage.getItem(this.STORAGE_KEY);
    return storedQuestions ? JSON.parse(storedQuestions) : [];
  }

  static removeWrongQuestion(questionId: number) {
    const wrongQuestions = this.getWrongQuestions();
    const updatedQuestions = wrongQuestions.filter(q => q.id !== questionId);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedQuestions));
  }

  static clearWrongQuestions() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
} 