// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import Link from "next/link";
import toast from "react-hot-toast";
import axios from "axios";

export default function UltraPremiumEmployeeManagement() {
  const router = useRouter();
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", role: "user", department: "" });

  // Real employee data from API
  const [employees, setEmployees] = useState<any[]>([]);

  const [realTimeStats, setRealTimeStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    avgPerformance: 0,
    departments: 0,
    totalProjects: 0,
    completedTasks: 0
  });

  // Load employees from API
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/employees', {
        params: {
          search: searchTerm,
          role: filterRole !== 'all' ? filterRole : undefined,
        }
      });

      setEmployees(data.employees || []);

      // Calculate stats
      const emps = data.employees || [];
      const avgPerf = emps.length > 0
        ? Math.round(emps.reduce((sum: number, e: any) => sum + (e.performance || 80), 0) / emps.length)
        : 0;
      const depts = new Set(emps.map((e: any) => e.department)).size;

      setRealTimeStats({
        totalEmployees: data.total || emps.length,
        activeEmployees: emps.filter((e: any) => e.status === 'active').length,
        avgPerformance: avgPerf,
        departments: depts,
        totalProjects: emps.reduce((sum: number, e: any) => sum + (e.projects || 0), 0),
        completedTasks: emps.reduce((sum: number, e: any) => sum + (e.tasksCompleted || 0), 0),
      });
    } catch (error: any) {
      console.error('Failed to load employees:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to load employees');
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterRole]);

  // Initial load
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Refresh periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadEmployees();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loadEmployees]);

  // Add new employee
  const handleAddEmployee = async () => {
    if (!newEmployee.email) {
      toast.error('Email is required');
      return;
    }

    try {
      await axios.post('/api/employees', newEmployee);
      toast.success('Employee added successfully!');
      setShowAddModal(false);
      setNewEmployee({ name: "", email: "", role: "user", department: "" });
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add employee');
    }
  };

  // Update employee
  const handleUpdateEmployee = async (employeeId: string, updates: any) => {
    try {
      await axios.patch('/api/employees', { employeeId, ...updates });
      toast.success('Employee updated!');
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update employee');
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await axios.delete(`/api/employees?id=${employeeId}`);
      toast.success('Employee deleted');
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete employee');
    }
  };

  const roles = {
    manager: { label: "Manager", color: "text-pink-400 bg-pink-500/20", icon: "👨‍💼" },
    sales: { label: "Sales", color: "text-yellow-400 bg-yellow-500/20", icon: "💼" },
    analyst: { label: "Analyst", color: "text-green-400 bg-green-500/20", icon: "📊" },
    developer: { label: "Developer", color: "text-purple-400 bg-purple-500/20", icon: "💻" },
    support: { label: "Support", color: "text-blue-400 bg-blue-500/20", icon: "🎧" }
  };

  const statuses = {
    active: { label: "Active", color: "text-green-400", icon: "🟢" },
    away: { label: "Away", color: "text-yellow-400", icon: "🟡" },
    offline: { label: "Offline", color: "text-gray-400", icon: "⚪" }
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesRole = filterRole === "all" || emp.role === filterRole;
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    const matchesSearch = searchTerm === "" ||
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const roleDistribution = Object.keys(roles).reduce((acc, role) => {
    acc[role] = employees.filter(e => e.role === role).length;
    return acc;
  }, {} as Record<string, number>);

  const performanceData = employees.map(emp => ({
    name: emp.name.split(' ')[0],
    performance: emp.performance,
    tasks: emp.tasksCompleted
  }));

  const departmentData = [
    { name: "Operations", employees: 1, color: "#8B5CF6" },
    { name: "Sales", employees: 1, color: "#F59E0B" },
    { name: "Data Analytics", employees: 1, color: "#10B981" },
    { name: "Engineering", employees: 1, color: "#3B82F6" },
    { name: "Customer Support", employees: 1, color: "#EF4444" }
  ];

  return (
    <div className="space-y-8">
      {/* Ultra-Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              👥
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Employee Management
              </h1>
              <p className="text-white/70 text-lg">Advanced team management and performance analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all transform hover:scale-105"
            >
              + Add Employee
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-600" : "bg-white/10"}`}
              >
                ⚏
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-600" : "bg-white/10"}`}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Employees", value: realTimeStats.totalEmployees, icon: "👥", color: "blue" },
            { label: "Active Now", value: realTimeStats.activeEmployees, icon: "🟢", color: "green" },
            { label: "Avg Performance", value: `${realTimeStats.avgPerformance}%`, icon: "📊", color: "purple" },
            { label: "Departments", value: realTimeStats.departments, icon: "🏢", color: "orange" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Advanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
      >
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white"
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">🔍</span>
            </div>
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white"
          >
            <option value="all">All Roles</option>
            {Object.entries(roles).map(([key, role]) => (
              <option key={key} value={key}>{role.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white"
          >
            <option value="all">All Status</option>
            {Object.entries(statuses).map(([key, status]) => (
              <option key={key} value={key}>{status.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Analytics Dashboard */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Performance Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="performance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🏢</span>
            Department Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="employees"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {departmentData.map((dept, index) => (
              <div key={dept.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                <span className="text-white/80">{dept.name}</span>
                <span className="text-white/60 ml-auto">{dept.employees} employee{dept.employees !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Employee Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">👥</span>
            Team Members ({filteredEmployees.length})
          </h3>
          <div className="flex gap-2">
            <Link href="/dashboard/employees/departments" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              Departments
            </Link>
            <Link href="/dashboard/employees/permissions" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
              Permissions
            </Link>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedEmployee(employee)}
                className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xl font-bold text-white">
                    {employee.avatar}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-white">{employee.name}</h4>
                    <p className="text-sm text-white/60">{employee.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${roles[employee.role as keyof typeof roles].color}`}>
                        {roles[employee.role as keyof typeof roles].icon} {roles[employee.role as keyof typeof roles].label}
                      </span>
                      <span className={`text-sm ${statuses[employee.status as keyof typeof statuses].color}`}>
                        {statuses[employee.status as keyof typeof statuses].icon}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{employee.performance}%</div>
                    <div className="text-xs text-white/60">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{employee.tasksCompleted}</div>
                    <div className="text-xs text-white/60">Tasks</div>
                  </div>
                </div>

                <div className="text-sm text-white/60 mb-3">
                  <div>📍 {employee.location}</div>
                  <div>📅 Joined {new Date(employee.joinDate).toLocaleDateString()}</div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {employee.skills.slice(0, 2).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {employee.skills.length > 2 && (
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded">
                      +{employee.skills.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEmployee(employee);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success(`Editing ${employee.name}`);
                    }}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-lg font-bold text-white">
                  {employee.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="font-bold text-lg text-white">{employee.name}</div>
                    <span className={`px-2 py-1 rounded-full text-xs ${roles[employee.role as keyof typeof roles].color}`}>
                      {roles[employee.role as keyof typeof roles].icon} {roles[employee.role as keyof typeof roles].label}
                    </span>
                    <span className={`${statuses[employee.status as keyof typeof statuses].color} text-sm`}>
                      {statuses[employee.status as keyof typeof statuses].icon} {statuses[employee.status as keyof typeof statuses].label}
                    </span>
                  </div>
                  <div className="text-sm text-white/60">{employee.email} • {employee.department}</div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-xs text-white/60 mb-1">Performance</div>
                    <div className="text-lg font-bold text-blue-400">{employee.performance}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-1">Tasks</div>
                    <div className="text-lg font-bold text-green-400">{employee.tasksCompleted}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-1">Last Active</div>
                    <div className="text-sm">{employee.lastActive}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEmployee(employee)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => toast.success(`Editing ${employee.name}`)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Access Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {[
          { title: "Team Management", description: "Organize teams and projects", icon: "👥", href: "/dashboard/employees/team" },
          { title: "Access Control", description: "Manage permissions and roles", icon: "🔐", href: "/dashboard/employees/access" },
          { title: "Activity Logs", description: "View employee activity and reports", icon: "📊", href: "/dashboard/employees/activity" }
        ].map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link href={action.href} className="block bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-4xl mb-3">{action.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{action.title}</h4>
              <p className="text-white/60 text-sm">{action.description}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-3xl">👥</span>
                Add New Employee
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white"
                    placeholder="employee@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Role</label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white"
                  >
                    <option value="user">User</option>
                    <option value="analyst">Analyst</option>
                    <option value="operator">Operator</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Department</label>
                  <input
                    type="text"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none text-white"
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEmployee}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all text-white font-bold"
                >
                  Add Employee
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && employees.length === 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Loading employees...</p>
          </div>
        </div>
      )}
    </div>
  );
}