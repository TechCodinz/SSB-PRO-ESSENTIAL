"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import toast from "react-hot-toast";

type DepartmentRecord = {
  id: string;
  name: string;
  icon: string;
  color: string;
  lead: string;
  members: number;
  teams: number;
  budget: string;
  performance: number;
  description: string;
  details?: {
    kpis?: Array<{ name: string; value: string; trend: string }>;
    teams?: string[];
    projects?: string[];
  };
};

const DEFAULT_DEPARTMENTS: DepartmentRecord[] = [
  {
    id: "dept-ops",
    name: "Operations",
    icon: "⚙️",
    color: "from-blue-500/20 to-cyan-500/20",
    lead: "Alice Johnson",
    members: 4,
    teams: 1,
    budget: "$450K",
    performance: 95,
    description: "Core business operations and process management",
    details: {
      kpis: [
        { name: "Efficiency", value: "95%", trend: "+5%" },
        { name: "On-time Delivery", value: "98%", trend: "+2%" },
        { name: "Cost Savings", value: "$50K", trend: "+15%" },
      ],
      teams: ["Operations Team"],
      projects: ["Process Optimization", "Workflow Automation", "Team Efficiency"],
    },
  },
  {
    id: "dept-sales",
    name: "Sales",
    icon: "💼",
    color: "from-yellow-500/20 to-orange-500/20",
    lead: "Bob Smith",
    members: 3,
    teams: 1,
    budget: "$350K",
    performance: 88,
    description: "Revenue generation and client acquisition",
    details: {
      kpis: [
        { name: "Revenue", value: "$1.2M", trend: "+18%" },
        { name: "Conversion Rate", value: "24%", trend: "+3%" },
        { name: "Pipeline Value", value: "$3.5M", trend: "+25%" },
      ],
      teams: ["Sales Squad"],
      projects: ["Q4 Revenue Push", "Market Expansion", "Client Retention"],
    },
  },
  {
    id: "dept-analytics",
    name: "Data Analytics",
    icon: "📊",
    color: "from-green-500/20 to-emerald-500/20",
    lead: "Carol White",
    members: 5,
    teams: 1,
    budget: "$500K",
    performance: 92,
    description: "Data analysis, insights, and reporting",
    details: {
      kpis: [
        { name: "Reports Generated", value: "247", trend: "+12%" },
        { name: "Data Accuracy", value: "99.7%", trend: "+0.2%" },
        { name: "Insights Delivered", value: "156", trend: "+20%" },
      ],
      teams: ["Data Analytics"],
      projects: ["Market Analysis", "Predictive Modeling", "Dashboard Development"],
    },
  },
  {
    id: "dept-eng",
    name: "Engineering",
    icon: "💻",
    color: "from-purple-500/20 to-pink-500/20",
    lead: "David Brown",
    members: 6,
    teams: 1,
    budget: "$800K",
    performance: 90,
    description: "Platform development and technical infrastructure",
    details: {
      kpis: [
        { name: "Uptime", value: "99.98%", trend: "0%" },
        { name: "Deploy Frequency", value: "15/week", trend: "+5" },
        { name: "Bug Resolution", value: "1.2 days", trend: "-0.3" },
      ],
      teams: ["Engineering Core"],
      projects: ["Platform v2.0", "API Optimization", "Security Enhancement"],
    },
  },
  {
    id: "dept-support",
    name: "Customer Support",
    icon: "🎧",
    color: "from-blue-500/20 to-purple-500/20",
    lead: "Emma Davis",
    members: 4,
    teams: 1,
    budget: "$300K",
    performance: 94,
    description: "Customer success and technical support",
    details: {
      kpis: [
        { name: "CSAT Score", value: "4.8/5", trend: "+0.2" },
        { name: "Response Time", value: "12 min", trend: "-2 min" },
        { name: "Tickets Resolved", value: "1,247", trend: "+15%" },
      ],
      teams: ["Support Heroes"],
      projects: ["Customer Onboarding", "Knowledge Base", "Support Automation"],
    },
  },
];

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentRecord[]>(DEFAULT_DEPARTMENTS);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/employees/departments", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load departments (${response.status})`);
        }
        const json = (await response.json()) as { departments: DepartmentRecord[] };
        if (Array.isArray(json.departments) && json.departments.length) {
          setDepartments(json.departments);
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to load departments from API. Showing latest snapshot.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalMembers = useMemo(
    () => departments.reduce((sum, dept) => sum + (dept.members || 0), 0),
    [departments]
  );
  const totalBudget = useMemo(
    () =>
      departments.reduce((sum, dept) => {
        const budgetNumber = parseInt((dept.budget || "0").replace(/[$Kk,\s]/g, ""));
        return sum + (Number.isFinite(budgetNumber) ? budgetNumber : 0);
      }, 0),
    [departments]
  );
  const avgPerformance = useMemo(() => {
    if (!departments.length) return 0;
    const total = departments.reduce((sum, dept) => sum + (dept.performance || 0), 0);
    return Math.round(total / departments.length);
  }, [departments]);

  const activeDepartment = useMemo(
    () => departments.find((dept) => dept.id === selectedDept) || null,
    [departments, selectedDept]
  );

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="bg-[#0f1630] border-b border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">🏢 Department Management</h1>
              <p className="text-white/60">Organize and manage company departments</p>
            </div>
            <div className="flex items-center gap-3">
              {loading && (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs uppercase tracking-[0.25em]">
                  Syncing…
                </span>
              )}
              <Link href="/dashboard/employees" className="btn btn-ghost">
                ← Back
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/dashboard/employees/departments/new")}
              >
                + Add Department
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Departments</span>
                <span className="text-2xl">🏢</span>
              </div>
              <div className="text-2xl font-bold">{departments.length}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Members</span>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{totalMembers}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Budget</span>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-2xl font-bold text-green-400">${totalBudget}K</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Avg Performance</span>
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{avgPerformance}%</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Departments Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="card hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedDept(dept.id)}
              >
                <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center mb-4`}>
                  <span className="text-6xl">{dept.icon}</span>
                </div>

                <h3 className="text-xl font-bold mb-2">{dept.name}</h3>
                <p className="text-sm text-white/60 mb-4">{dept.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Department Head:</span>
                    <span className="font-medium">{dept.lead}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Members:</span>
                    <span className="font-medium">{dept.members}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Budget:</span>
                    <span className="font-medium">{dept.budget}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/60">Performance</span>
                    <span className="font-medium">{dept.performance}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                      style={{width: `${dept.performance}%`}}
                    ></div>
                  </div>
                </div>

                <button
                  className="btn btn-primary text-sm w-full"
                  onClick={() => {
                    setSelectedDept(dept.id);
                    toast.success(`${dept.name} insights loaded`);
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Department Details */}
          {activeDepartment && (
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${
                    activeDepartment.color
                  } flex items-center justify-center text-4xl`}>
                    {activeDepartment.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {activeDepartment.name}
                    </h3>
                    <p className="text-white/60">
                      {activeDepartment.description}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDept(null)}
                  className="btn btn-ghost text-sm"
                >
                  Close
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* KPIs */}
                <div className="bg-black/20 rounded-lg p-6">
                  <h4 className="font-bold mb-4 text-lg">Key Performance Indicators</h4>
                  <div className="space-y-3">
                    {(activeDepartment.details?.kpis || []).map((kpi, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-white/60">{kpi.name}:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{kpi.value}</span>
                          <span className={`text-xs ${
                            kpi.trend.startsWith("+") || kpi.trend.startsWith("↑") 
                              ? "text-green-400" 
                              : kpi.trend.startsWith("-") || kpi.trend.startsWith("↓")
                              ? "text-red-400"
                              : "text-white/60"
                          }`}>
                            {kpi.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teams */}
                <div className="bg-black/20 rounded-lg p-6">
                  <h4 className="font-bold mb-4 text-lg">Teams</h4>
                  <div className="space-y-2">
                    {(activeDepartment.details?.teams || []).map((team, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                        <span className="text-2xl">👥</span>
                        <span className="font-medium">{team}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="bg-black/20 rounded-lg p-6">
                  <h4 className="font-bold mb-4 text-lg">Active Projects</h4>
                  <div className="space-y-2">
                    {(activeDepartment.details?.projects || []).map((project, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                        <span className="text-2xl">📁</span>
                        <span className="text-sm">{project}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Organizational Chart */}
          <div className="card mb-8">
            <h3 className="text-2xl font-bold mb-6">Organizational Structure</h3>
            <div className="flex flex-col items-center">
              {/* CEO */}
              <div className="card bg-gradient-to-br from-red-500/20 to-pink-500/20 p-6 text-center mb-8 max-w-xs">
                <div className="text-4xl mb-2">👑</div>
                <div className="font-bold text-lg">CEO</div>
                <div className="text-sm text-white/60">Chief Executive Officer</div>
              </div>

              {/* Department Heads */}
              <div className="grid md:grid-cols-5 gap-4 w-full">
                {departments.map((dept) => (
                  <div key={dept.id} className="card text-center">
                    <div className="text-3xl mb-2">{dept.icon}</div>
                    <div className="font-bold mb-1">{dept.name}</div>
                    <div className="text-sm text-white/60 mb-2">{dept.lead}</div>
                    <div className="text-xs text-white/40">{dept.members} members</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="card">
            <h3 className="text-2xl font-bold mb-6">Budget Allocation</h3>
            <div className="space-y-4">
              {departments.map((dept) => {
                const budget = parseInt((dept.budget || "0").replace(/[$Kk,\s]/g, ""));
                const percentage = totalBudget ? Math.round((budget / totalBudget) * 100) : 0;

                return (
                  <div key={dept.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dept.icon}</span>
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-400">{dept.budget}</span>
                        <span className="text-sm text-white/60">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-3 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" 
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Link href="/dashboard/employees/team" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">👥</div>
              <div className="font-bold mb-2">Team Management</div>
              <div className="text-sm text-white/60">Manage department teams</div>
            </Link>

            <Link href="/dashboard/employees/access" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">🔐</div>
              <div className="font-bold mb-2">Department Access</div>
              <div className="text-sm text-white/60">Configure permissions</div>
            </Link>

            <Link href="/dashboard/employees" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">👤</div>
              <div className="font-bold mb-2">Employee List</div>
              <div className="text-sm text-white/60">View all employees</div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
