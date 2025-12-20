"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import toast from "react-hot-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "review" | "completed";
  assigned_to: string;
  due_date: Date;
  progress: number;
  tags: string[];
}

const PRIORITY_ORDER: Record<Task["priority"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

type StatusColor = "gray" | "blue" | "purple" | "green";

const STATUS_FILTER_STYLES: Record<StatusColor, string> = {
  gray: "bg-gray-500/20 border-2 border-gray-500/50",
  blue: "bg-blue-500/20 border-2 border-blue-500/50",
  purple: "bg-purple-500/20 border-2 border-purple-500/50",
  green: "bg-green-500/20 border-2 border-green-500/50",
};

type RoleColor = "blue" | "purple" | "red" | "green" | "cyan" | "gray";

const ROLE_COLOR_THEMES: Record<RoleColor, { gradient: string; border: string; text: string }> = {
  blue: { gradient: "from-blue-500/10 via-blue-500/5", border: "border-blue-500/30", text: "text-blue-400" },
  purple: { gradient: "from-purple-500/10 via-purple-500/5", border: "border-purple-500/30", text: "text-purple-400" },
  red: { gradient: "from-red-500/10 via-red-500/5", border: "border-red-500/30", text: "text-red-400" },
  green: { gradient: "from-green-500/10 via-green-500/5", border: "border-green-500/30", text: "text-green-400" },
  cyan: { gradient: "from-cyan-500/10 via-cyan-500/5", border: "border-cyan-500/30", text: "text-cyan-400" },
  gray: { gradient: "from-gray-500/10 via-gray-500/5", border: "border-gray-500/30", text: "text-gray-400" },
};

interface RoleBasedTaskDashboardProps {
  role: "USER" | "ANALYST" | "MANAGER" | "ADMIN" | "SALES" | "SUPPORT" | "DEVELOPER";
  userId: string;
  userName: string;
}

export default function RoleBasedTaskDashboard({ 
  role, 
  userId, 
  userName 
}: RoleBasedTaskDashboardProps) {
  
  // Role-specific tasks and metrics
  const getRoleConfig = () => {
    switch (role) {
      case "ANALYST":
        return {
          title: "Data Analyst Dashboard",
          icon: "📊",
          color: "blue",
          tasks: [
            {
              id: "1",
              title: "Analyze Q4 Transaction Patterns",
              description: "Deep dive into Q4 transactions to identify anomalies and trends",
              priority: "high" as const,
              status: "in_progress" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 2),
              progress: 65,
              tags: ["analytics", "quarterly", "priority"]
            },
            {
              id: "2",
              title: "Build Predictive Model",
              description: "Create ML model for fraud prediction",
              priority: "critical" as const,
              status: "todo" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 5),
              progress: 0,
              tags: ["ml", "prediction", "fraud"]
            },
            {
              id: "3",
              title: "Generate Performance Report",
              description: "Monthly anomaly detection performance analysis",
              priority: "medium" as const,
              status: "review" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000),
              progress: 90,
              tags: ["reporting", "monthly"]
            }
          ],
          metrics: [
            { label: "Analyses Completed", value: 156, icon: "✅", trend: "+23%" },
            { label: "Anomalies Found", value: 892, icon: "⚠️", trend: "+15%" },
            { label: "Reports Generated", value: 45, icon: "📄", trend: "+8%" },
            { label: "Accuracy Rate", value: "98.7%", icon: "🎯", trend: "+2.1%" }
          ]
        };
      
      case "MANAGER":
        return {
          title: "Manager Dashboard",
          icon: "👨‍💼",
          color: "purple",
          tasks: [
            {
              id: "1",
              title: "Review Team Performance",
              description: "Weekly team performance review and feedback",
              priority: "high" as const,
              status: "in_progress" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000),
              progress: 40,
              tags: ["team", "review", "weekly"]
            },
            {
              id: "2",
              title: "Approve Role Changes",
              description: "Review and approve 5 pending role change requests",
              priority: "critical" as const,
              status: "todo" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 2),
              progress: 0,
              tags: ["approval", "hr"]
            },
            {
              id: "3",
              title: "Budget Planning",
              description: "Q1 budget allocation for anomaly detection systems",
              priority: "high" as const,
              status: "in_progress" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 7),
              progress: 55,
              tags: ["finance", "planning"]
            }
          ],
          metrics: [
            { label: "Team Members", value: 12, icon: "👥", trend: "+2" },
            { label: "Active Projects", value: 8, icon: "📁", trend: "+1" },
            { label: "Tasks Completed", value: 234, icon: "✅", trend: "+18%" },
            { label: "Team Efficiency", value: "94%", icon: "⚡", trend: "+5%" }
          ]
        };
      
      case "ADMIN":
        return {
          title: "System Administrator Dashboard",
          icon: "👑",
          color: "red",
          tasks: [
            {
              id: "1",
              title: "System Health Check",
              description: "Complete system audit and performance optimization",
              priority: "critical" as const,
              status: "in_progress" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000),
              progress: 75,
              tags: ["system", "critical", "maintenance"]
            },
            {
              id: "2",
              title: "User Access Audit",
              description: "Review and update user permissions across all roles",
              priority: "high" as const,
              status: "todo" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 3),
              progress: 0,
              tags: ["security", "audit", "permissions"]
            },
            {
              id: "3",
              title: "Deploy Security Patches",
              description: "Apply latest security updates to production environment",
              priority: "critical" as const,
              status: "review" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 2),
              progress: 85,
              tags: ["security", "deployment"]
            }
          ],
          metrics: [
            { label: "Total Users", value: 1247, icon: "👥", trend: "+45" },
            { label: "System Uptime", value: "99.9%", icon: "✅", trend: "Stable" },
            { label: "Active Sessions", value: 892, icon: "🟢", trend: "+12%" },
            { label: "Security Score", value: "A+", icon: "🛡️", trend: "Excellent" }
          ]
        };
      
      case "SALES":
        return {
          title: "Sales Dashboard",
          icon: "💼",
          color: "green",
          tasks: [
            {
              id: "1",
              title: "Follow up with Enterprise Leads",
              description: "Contact 8 enterprise prospects for demo scheduling",
              priority: "high" as const,
              status: "in_progress" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000),
              progress: 50,
              tags: ["sales", "enterprise", "leads"]
            },
            {
              id: "2",
              title: "Prepare Q4 Sales Report",
              description: "Compile Q4 sales metrics and projections",
              priority: "medium" as const,
              status: "todo" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 5),
              progress: 0,
              tags: ["reporting", "quarterly"]
            },
            {
              id: "3",
              title: "Contract Renewals",
              description: "Process 12 contract renewals this week",
              priority: "critical" as const,
              status: "in_progress" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 3),
              progress: 70,
              tags: ["contracts", "renewals"]
            }
          ],
          metrics: [
            { label: "Monthly Revenue", value: "$124K", icon: "💰", trend: "+23%" },
            { label: "Deals Closed", value: 34, icon: "🤝", trend: "+8" },
            { label: "Pipeline Value", value: "$890K", icon: "📈", trend: "+15%" },
            { label: "Conversion Rate", value: "34%", icon: "🎯", trend: "+5%" }
          ]
        };
      
      case "SUPPORT":
        return {
          title: "Customer Support Dashboard",
          icon: "🎧",
          color: "cyan",
          tasks: [
            {
              id: "1",
              title: "Resolve High-Priority Tickets",
              description: "Address 15 high-priority support tickets",
              priority: "critical" as const,
              status: "in_progress" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000),
              progress: 60,
              tags: ["support", "urgent", "tickets"]
            },
            {
              id: "2",
              title: "Update Knowledge Base",
              description: "Add 10 new FAQ articles based on recent queries",
              priority: "medium" as const,
              status: "todo" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 4),
              progress: 0,
              tags: ["documentation", "kb"]
            },
            {
              id: "3",
              title: "Customer Satisfaction Survey",
              description: "Analyze feedback from 50 recent interactions",
              priority: "low" as const,
              status: "completed" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() - 86400000),
              progress: 100,
              tags: ["feedback", "analysis"]
            }
          ],
          metrics: [
            { label: "Tickets Resolved", value: 234, icon: "✅", trend: "+12%" },
            { label: "Avg Response Time", value: "2.3h", icon: "⏱️", trend: "-15%" },
            { label: "Satisfaction Score", value: "4.8/5", icon: "⭐", trend: "+0.2" },
            { label: "Active Tickets", value: 45, icon: "📋", trend: "-8" }
          ]
        };
      
      default: // USER
        return {
          title: "User Dashboard",
          icon: "👤",
          color: "gray",
          tasks: [
            {
              id: "1",
              title: "Complete Profile",
              description: "Fill out your profile information",
              priority: "medium" as const,
              status: "todo" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 7),
              progress: 0,
              tags: ["profile", "setup"]
            },
            {
              id: "2",
              title: "Run First Analysis",
              description: "Upload data and perform your first anomaly detection",
              priority: "low" as const,
              status: "todo" as const,
              assigned_to: userName,
              due_date: new Date(Date.now() + 86400000 * 14),
              progress: 0,
              tags: ["onboarding", "tutorial"]
            }
          ],
          metrics: [
            { label: "Analyses Run", value: 3, icon: "📊", trend: "+3" },
            { label: "Anomalies Found", value: 12, icon: "⚠️", trend: "+12" },
            { label: "Account Age", value: "5 days", icon: "📅", trend: "New" },
            { label: "Plan", value: "FREE", icon: "📦", trend: "Active" }
          ]
        };
    }
  };

  const config = getRoleConfig();
  const roleTheme = ROLE_COLOR_THEMES[config.color as RoleColor] ?? ROLE_COLOR_THEMES.blue;
  const [tasks, setTasks] = useState<Task[]>(config.tasks);
  const [filter, setFilter] = useState<"all" | Task["status"]>("all");
  const [sortBy, setSortBy] = useState<"priority" | "due_date" | "progress">("priority");
  const [activeTask, setActiveTask] = useState<Task | null>(config.tasks[0] ?? null);

  const filteredTasks = tasks.filter(task => 
    filter === "all" || task.status === filter
  );

  const sortedTasks = useMemo(() => {
    const tasksCopy = [...filteredTasks];
    switch (sortBy) {
      case "priority":
        return tasksCopy.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
      case "due_date":
        return tasksCopy.sort((a, b) => a.due_date.getTime() - b.due_date.getTime());
      case "progress":
        return tasksCopy.sort((a, b) => b.progress - a.progress);
      default:
        return tasksCopy;
    }
  }, [filteredTasks, sortBy]);

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "critical": return "bg-red-500/20 text-red-300 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "low": return "bg-green-500/20 text-green-300 border-green-500/30";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "todo": return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "in_progress": return "bg-blue-500/20 text-blue-300 border-blue-500/30 animate-pulse";
      case "review": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "completed": return "bg-green-500/20 text-green-300 border-green-500/30";
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    review: tasks.filter(t => t.status === "review").length,
    completed: tasks.filter(t => t.status === "completed").length
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: `${Date.now()}`,
      title: "New Task",
      description: "Customize this task from the task manager panel",
      priority: "medium" as const,
      status: "todo" as const,
      assigned_to: userName,
      due_date: new Date(Date.now() + 86400000 * 3),
      progress: 0,
      tags: [role.toLowerCase(), "new"],
    };

    setTasks((prev) => [newTask, ...prev]);
    setActiveTask(newTask);
    toast.success("Draft task created. Open the task manager to finalize details.");
  };

  const handleUpdateProgress = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              progress: Math.min(task.progress + 10, 100),
              status: task.progress + 10 >= 100 ? "completed" : task.status === "todo" ? "in_progress" : task.status,
            }
          : task
      )
    );

    toast.success("Task progress updated");
  };

  return (
    <div className="space-y-6">
      {/* Role Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${roleTheme.gradient} to-transparent backdrop-blur-xl border ${roleTheme.border} rounded-2xl p-6`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{config.icon}</span>
            <div>
              <h2 className="text-3xl font-bold text-white">{config.title}</h2>
              <p className="text-white/70 text-lg">Welcome, {userName}!</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold ${roleTheme.text} mb-1`}>ROLE: {role}</div>
            <div className="text-xs text-white/60">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {config.metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{metric.icon}</span>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">
                {metric.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-xs text-white/60">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Task Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { status: "todo" as const, label: "To Do", count: tasksByStatus.todo, color: "gray", icon: "📋" },
          { status: "in_progress" as const, label: "In Progress", count: tasksByStatus.in_progress, color: "blue", icon: "⚙️" },
          { status: "review" as const, label: "Review", count: tasksByStatus.review, color: "purple", icon: "👁️" },
          { status: "completed" as const, label: "Completed", count: tasksByStatus.completed, color: "green", icon: "✅" }
        ].map((item, index) => (
          <motion.button
            key={item.status}
            onClick={() => setFilter(filter === item.status ? "all" : item.status)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-xl transition-all ${
              filter === item.status 
                ? STATUS_FILTER_STYLES[item.color as StatusColor] ?? STATUS_FILTER_STYLES.gray 
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-2xl font-bold text-white">{item.count}</div>
            <div className="text-sm text-white/60">{item.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Your Tasks</h3>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value="priority">Sort by Priority</option>
              <option value="due_date">Sort by Due Date</option>
              <option value="progress">Sort by Progress</option>
            </select>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              + Add Task
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {sortedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-white text-lg">{task.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-white/70 text-sm mb-3">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {task.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                      <div>📅 Due: {task.due_date.toLocaleDateString()}</div>
                      <div>👤 {task.assigned_to}</div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/60">Progress</span>
                        <span className="text-xs font-bold text-white">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-2 rounded-full ${
                            task.progress < 30 ? 'bg-red-500' :
                            task.progress < 70 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setActiveTask(task)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(task.id)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {activeTask && (
        <motion.div
          key={activeTask.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white">{activeTask.title}</h3>
              <p className="text-white/60 text-sm max-w-2xl">{activeTask.description}</p>
            </div>
            <button
              onClick={() => setActiveTask(null)}
              className="text-sm text-white/50 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4 text-sm text-white/70">
            <div>
              <div className="text-white/40 uppercase text-xs mb-1">Priority</div>
              <div className="font-semibold capitalize">{activeTask.priority}</div>
            </div>
            <div>
              <div className="text-white/40 uppercase text-xs mb-1">Status</div>
              <div className="font-semibold capitalize">{activeTask.status.replace("_", " ")}</div>
            </div>
            <div>
              <div className="text-white/40 uppercase text-xs mb-1">Due Date</div>
              <div className="font-semibold">{activeTask.due_date.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-white/40 uppercase text-xs mb-1">Progress</div>
              <div className="font-semibold">{activeTask.progress}%</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-white/40 uppercase text-xs mb-1">Tags</div>
            <div className="flex flex-wrap gap-2">
              {activeTask.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
