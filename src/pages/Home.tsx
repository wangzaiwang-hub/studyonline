import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const modeButtons = [
  {
    title: "顺序刷题",
    icon: "fa-solid fa-list-ol",
    color: "bg-[#98FF98]",
    path: "/sequential"
  },
  {
    title: "随机刷题",
    icon: "fa-solid fa-shuffle",
    color: "bg-[#87CEEB]",
    path: "/random"
  },
  {
    title: "刷错题",
    icon: "fa-solid fa-rotate-left",
    color: "bg-[#FF7F50]",
    path: "/review"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F6] p-4">
      <h1 className="text-2xl font-bold text-[#333333] mb-8">在线答题系统</h1>
      <div className="w-full max-w-md space-y-4">
        {modeButtons.map((button) => (
          <motion.div
            key={button.title}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            <Link
              to={button.path}
              className={`${button.color} flex flex-col items-center justify-center p-6 rounded-lg shadow-md text-white font-medium text-lg`}
            >
              <i className={`${button.icon} text-2xl mb-2`}></i>
              {button.title}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}