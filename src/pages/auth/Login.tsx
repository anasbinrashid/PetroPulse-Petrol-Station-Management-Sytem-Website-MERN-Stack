import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { VideoBackground } from "@/components/VideoBackground";

export default function Login() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"admin" | "employee" | "customer" | null>(null);

  const handleTypeSelect = (type: "admin" | "employee" | "customer") => {
    setSelectedType(type);
    setTimeout(() => {
      navigate(`/auth/${type}`);
    }, 500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <VideoBackground />
      <div className="relative z-10 flex items-center justify-center md:justify-end h-full px-4 md:px-8 lg:pr-24">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 text-white"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Welcome to Petro-Pulse</h2>
          <p className="text-lg md:text-xl text-gray-200 mb-6 md:mb-8">Choose how you want to sign in</p>

          <div className="space-y-3 md:space-y-4">
            {/* Admin Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeSelect("admin")}
              className="w-full p-4 md:p-5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center space-x-3 md:space-x-4"
            >
              <i className="fas fa-shield-alt text-blue-400 text-xl md:text-2xl"></i>
              <div className="text-left">
                <div className="text-base md:text-lg font-medium">Admin</div>
                <div className="text-sm md:text-base text-gray-300">Access station management dashboard</div>
              </div>
            </motion.button>

            {/* Employee Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeSelect("employee")}
              className="w-full p-4 md:p-5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center space-x-3 md:space-x-4"
            >
              <i className="fas fa-user-tie text-green-400 text-xl md:text-2xl"></i>
              <div className="text-left">
                <div className="text-base md:text-lg font-medium">Employee</div>
                <div className="text-sm md:text-base text-gray-300">Access your employee portal</div>
              </div>
            </motion.button>

            {/* Customer Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeSelect("customer")}
              className="w-full p-4 md:p-5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center space-x-3 md:space-x-4"
            >
              <i className="fas fa-users text-purple-400 text-xl md:text-2xl"></i>
              <div className="text-left">
                <div className="text-base md:text-lg font-medium">Customer</div>
                <div className="text-sm md:text-base text-gray-300">Access your customer account</div>
              </div>
            </motion.button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
