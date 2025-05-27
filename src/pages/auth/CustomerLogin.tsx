import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/services/api";
import { AuthResponse } from "@/types/api";
import { VideoBackground } from "@/components/VideoBackground";

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(true);
      setTimeout(() => setError(false), 800);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.auth.login(email, password);
      
      if (response.success && response.data) {
        const userData = response.data as AuthResponse;
        
        if (userData.userType !== 'customer') {
          toast.error("Access denied. Please use the customer account.");
          setIsLoading(false);
          return;
        }
        
        localStorage.setItem("token", userData.token);
        localStorage.setItem("userType", "customer");
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userName", userData.name);
        if (userData.profile) {
          localStorage.setItem("userProfile", JSON.stringify(userData.profile));
        }
        
        toast.success(`Welcome back, ${userData.name}!`);
        navigate("/customer/dashboard");
      } else {
        toast.error(response.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login");
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="text-2xl md:text-4xl font-bold mb-3">Customer Login</h2>
          <p className="text-lg md:text-xl text-gray-200 mb-6 md:mb-8">Sign in to access your account</p>

          <form onSubmit={handleSubmit} className={`space-y-4 md:space-y-6 transition-all ${error ? "animate-shake" : ""}`}>
            {/* Email Field */}
            <div>
              <label className="block mb-2 text-base md:text-lg text-gray-200">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="customer@example.com"
                className="bg-transparent text-white placeholder-gray-300 border-b border-gray-300 focus:outline-none w-full p-2 text-base md:text-lg"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block mb-2 text-base md:text-lg text-gray-200">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent text-white placeholder-gray-300 border-b border-gray-300 focus:outline-none w-full p-2 text-base md:text-lg"
              />
            </div>

            {/* Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-4 bg-purple-600 text-white font-semibold rounded-md transition mb-4 text-lg md:text-xl disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </motion.button>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 text-sm md:text-base text-gray-300">
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="w-4 h-4" />
                <span>Remember me</span>
              </div>
              <a href="#" className="hover:underline text-purple-400">
                Forgot password?
              </a>
            </div>

            {/* Back to Selection */}
            <div className="mt-6 md:mt-8 text-center">
              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="text-purple-400 hover:underline text-base md:text-lg"
              >
                ← Back to Login Selection
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
