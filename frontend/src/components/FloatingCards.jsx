import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, CreditCard } from 'lucide-react';

const FloatingCards = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Task Card */}
      <motion.div
        className="absolute top-1/4 right-10 w-80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 pointer-events-auto"
        initial={{ opacity: 0, x: 100, y: -50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        whileHover={{ scale: 1.05, rotate: 2 }}
        drag
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Daily Tasks</h3>
            <p className="text-sm text-gray-500">5 tasks pending</p>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900 font-medium">75%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 2, delay: 1.5 }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-500">Updated 2 minutes ago</div>
      </motion.div>

      {/* Analytics Card */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-96 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 pointer-events-auto"
        initial={{ opacity: 0, x: 150, y: 50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        whileHover={{ scale: 1.02, rotate: -1 }}
        drag
        dragConstraints={{ left: -150, right: 150, top: -100, bottom: 100 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Today</h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Net volume</div>
            <div className="text-2xl font-bold text-gray-900">₹35,28,198.72</div>
            <div className="text-sm text-green-500">+14.00</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Yesterday</div>
            <div className="text-2xl font-bold text-gray-900">₹23,31,556.34</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">Net volume from sales</div>
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">₹39,274.29</span>
            <span className="text-green-500 text-sm ml-2">+42.8%</span>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2">
          <svg className="w-full h-full" viewBox="0 0 200 40">
            <motion.polyline
              fill="none"
              stroke="url(#chartGradient)"
              strokeWidth="2"
              points="0,30 25,20 50,25 75,15 100,18 125,12 150,16 175,8 200,10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 2 }}
            />
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="text-xs text-gray-500 mt-2">Updated today 07:50</div>
      </motion.div>

      {/* Payment Card */}
      <motion.div
        className="absolute top-1/2 right-8 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 pointer-events-auto"
        initial={{ opacity: 0, x: 120, y: 100 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1, delay: 1.4 }}
        whileHover={{ scale: 1.03, rotate: 1 }}
        drag
        dragConstraints={{ left: -120, right: 120, top: -150, bottom: 100 }}
      >
        <div className="mb-6">
          <div className="bg-black text-white px-4 py-2 rounded-lg text-center font-medium text-sm mb-4">
            <CreditCard className="inline w-4 h-4 mr-2" />
            Pay
          </div>
          <div className="text-center text-sm text-gray-500 mb-4">Or pay with card</div>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          
          <input
            type="text"
            placeholder="1234 1234 1234 1234"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="MM / YY"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="CVC"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
            <option>India</option>
            <option>United States</option>
            <option>United Kingdom</option>
          </select>

          <input
            type="text"
            placeholder="Postcode"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />

          <motion.button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Pay
          </motion.button>
        </div>
      </motion.div>

      {/* Floating Abstract Elements */}
      <motion.div
        className="absolute top-1/5 left-1/4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-30 blur-sm"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-1/4 left-1/5 w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-25 blur-sm"
        animate={{
          y: [0, 40, 0],
          x: [0, -25, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </div>
  );
};

export default FloatingCards;