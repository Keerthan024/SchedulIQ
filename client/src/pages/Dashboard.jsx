import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Enhanced mock data
const utilizationData = [
  { name: "Computer Labs", utilization: 75, capacity: 85, trend: 5 },
  { name: "Classrooms", utilization: 60, capacity: 92, trend: -2 },
  { name: "Equipment", utilization: 90, capacity: 78, trend: 8 },
  { name: "Study Rooms", utilization: 45, capacity: 65, trend: 12 },
  { name: "Auditoriums", utilization: 30, capacity: 95, trend: -5 },
];

const timeSeriesData = [
  { hour: "9 AM", utilization: 45 },
  { hour: "10 AM", utilization: 65 },
  { hour: "11 AM", utilization: 80 },
  { hour: "12 PM", utilization: 70 },
  { hour: "1 PM", utilization: 85 },
  { hour: "2 PM", utilization: 90 },
  { hour: "3 PM", utilization: 75 },
  { hour: "4 PM", utilization: 60 },
];

const categoryData = [
  { name: "In Use", value: 65, color: "#3B82F6" },
  { name: "Available", value: 25, color: "#10B981" },
  { name: "Maintenance", value: 8, color: "#F59E0B" },
  { name: "Conflict", value: 2, color: "#EF4444" },
];

const stats = [
  { label: "Total Resources", value: "48", change: "+12%", trend: "up" },
  { label: "Avg Utilization", value: "68%", change: "+5%", trend: "up" },
  { label: "Active Bookings", value: "156", change: "+8%", trend: "up" },
  { label: "Conflict Rate", value: "2.3%", change: "-1.2%", trend: "down" },
];

const MContainer = motion.div;
const MCard = motion.div;
const MText = motion.p;
const MButton = motion.button;

export default function Dashboard() {
  const [animatedStats, setAnimatedStats] = useState(stats.map(stat => ({ ...stat, animatedValue: 0 })));

  useEffect(() => {
    // Animate numbers on mount
    const timer = setTimeout(() => {
      setAnimatedStats(stats);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-blue-600">
            Utilization: <span className="font-bold">{payload[0].value}%</span>
          </p>
          {payload[1] && (
            <p className="text-green-600">
              Capacity: <span className="font-bold">{payload[1].value}%</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <MContainer
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <MCard variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Real-time resource utilization and performance metrics</p>
      </MCard>

      {/* Stats Grid */}
      <MCard
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {animatedStats.map((stat, index) => (
          <MCard
            key={stat.label}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
            <div className="flex items-baseline justify-between">
              <MText
                className="text-3xl font-bold text-gray-800"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
              >
                {stat.value}
              </MText>
              <span className={`text-sm font-semibold ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: stat.trend === 'up' ? '75%' : '40%' }}
                transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
              />
            </div>
          </MCard>
        ))}
      </MCard>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Utilization Bar Chart */}
        <MCard
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Resource Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="utilization" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="Current Utilization"
              >
                {utilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.7 + index * 0.1})`} />
                ))}
              </Bar>
              <Bar 
                dataKey="capacity" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
                name="Total Capacity"
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </MCard>

        {/* Time Series Line Chart */}
        <MCard
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Hourly Utilization Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="utilization"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#7C3AED' }}
                name="Utilization %"
              />
            </LineChart>
          </ResponsiveContainer>
        </MCard>

        {/* Pie Chart */}
        <MCard
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Resource Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </MCard>

        {/* Quick Actions */}
        <MCard
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            {[
              { icon: "📊", label: "Generate Report", color: "blue" },
              { icon: "🔍", label: "View Conflicts", color: "red" },
              { icon: "⚡", label: "Optimize Schedule", color: "green" },
              { icon: "📋", label: "Manage Resources", color: "purple" },
            ].map((action) => (
              <MButton
                key={action.label}
                className={`w-full flex items-center space-x-3 p-4 rounded-xl bg-${action.color}-50 border border-${action.color}-200 hover:shadow-md transition-all duration-300`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="font-medium text-gray-700">{action.label}</span>
              </MButton>
            ))}
          </div>
        </MCard>
      </div>
    </MContainer>
  );
}