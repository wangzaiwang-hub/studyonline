import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import SequentialPage from "@/pages/SequentialPage";
import RandomPage from "@/pages/RandomPage";
import ReviewPage from "@/pages/ReviewPage";
import WrongQuestionsPage from "@/pages/WrongQuestionsPage";
import { createContext, useState } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: (value: boolean) => {},
  logout: () => {},
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sequential" element={<SequentialPage />} />
        <Route path="/random" element={<RandomPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/wrong-questions" element={<WrongQuestionsPage />} />
      </Routes>
    </AuthContext.Provider>
  );
}
