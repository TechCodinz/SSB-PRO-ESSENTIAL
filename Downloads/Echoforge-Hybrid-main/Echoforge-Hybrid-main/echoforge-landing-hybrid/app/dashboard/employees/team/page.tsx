"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import toast from "react-hot-toast";

type TeamRecord = {
  id: string;
  name: string;
  lead: string;
  members: number;
  projects: number;
  performance: number;
  status: "active" | "paused" | "archived";
  department: string;
  description: string;
  roster?: Array<{ name: string; role: string; status: "active" | "away" | "offline" }>;
};

type ProjectSnapshot = {
  id: string;
  name: string;
  team: string;
  progress: number;
  deadline: string;
  status: "ahead" | "on-track" | "at-risk";
};

const DEFAULT_TEAMS: TeamRecord[] = [
  {
    id: "team-ops",
    name: "Operations Team",
    lead: "Alice Johnson",
    members: 4,
    projects: 8,
    performance: 95,
    status: "active",
    department: "Operations",
    description: "Core operations and daily management",
    roster: [
      { name: "Alice Johnson", role: "Manager", status: "active" },
      { name: "Michael Chen", role: "Analyst", status: "active" },
      { name: "Sarah Parker", role: "Support", status: "active" },
      { name: "Tom Wilson", role: "Analyst", status: "away" },
    ],
  },
  {
    id: "team-sales",
    name: "Sales Squad",
    lead: "Bob Smith",
    members: 3,
    projects: 12,
    performance: 88,
    status: "active",
    department: "Sales",
    description: "Client acquisition and revenue growth",
    roster: [
      { name: "Bob Smith", role: "Sales", status: "active" },
      { name: "Jennifer Lee", role: "Sales", status: "active" },
      { name: "Mark Johnson", role: "Sales", status: "active" },
    ],
  },
  {
    id: "team-analytics",
    name: "Data Analytics",
    lead: "Carol White",
    members: 5,
    projects: 15,
    performance: 92,
    status: "active",
    department: "Analytics",
    description: "Data analysis and insights generation",
    roster: [
      { name: "Carol White", role: "Analyst", status: "active" },
      { name: "Frank Miller", role: "Analyst", status: "active" },
      { name: "Lisa Anderson", role: "Analyst", status: "active" },
      { name: "James Taylor", role: "Analyst", status: "away" },
      { name: "Nina Rodriguez", role: "Analyst", status: "active" },
    ],
  },
  {
    id: "team-eng",
    name: "Engineering Core",
    lead: "David Brown",
    members: 6,
    projects: 10,
    performance: 90,
    status: "active",
    department: "Engineering",
    description: "Platform development and maintenance",
    roster: [
      { name: "David Brown", role: "Developer", status: "away" },
      { name: "Grace Lee", role: "Developer", status: "offline" },
      { name: "Robert Clark", role: "Developer", status: "active" },
      { name: "Amanda White", role: "Developer", status: "active" },
      { name: "Kevin Martinez", role: "Developer", status: "active" },
      { name: "Sophie Chen", role: "Developer", status: "active" },
    ],
  },
  {
    id: "team-support",
    name: "Support Heroes",
    lead: "Emma Davis",
    members: 4,
    projects: 6,
    performance: 94,
    status: "active",
    department: "Support",
    description: "Customer support and success",
    roster: [
      { name: "Emma Davis", role: "Support", status: "active" },
      { name: "Henry Wilson", role: "Support", status: "active" },
      { name: "Olivia Brown", role: "Support", status: "active" },
      { name: "Daniel Garcia", role: "Support", status: "active" },
    ],
  },
];

const buildProjects = (teams: TeamRecord[]): ProjectSnapshot[] => {
  if (!teams.length) return [];
  return teams.slice(0, 6).map((team, index) => {
    const performance = team.performance || 0;
    const baseProgress = Math.min(95, Math.max(40, performance - 5 + index * 4));
    const statuses: ProjectSnapshot["status"][] = ["on-track", "ahead", "on-track", "at-risk"];
    const status = statuses[index % statuses.length];
    const deadline = new Date(Date.now() + (index + 1) * 86400000 * 5).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return {
      id: `${team.id}-project-${index}`,
      name: `${team.name} Initiative ${index + 1}`,
      team: team.name,
      progress: Math.min(100, baseProgress),
      deadline,
      status,
    };
  });
};

export default function TeamManagementPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRecord[]>(DEFAULT_TEAMS);
  const [projects, setProjects] = useState<ProjectSnapshot[]>(buildProjects(DEFAULT_TEAMS));
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/employees/teams", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load teams (${response.status})`);
        }
        const json = (await response.json()) as { teams: TeamRecord[] };
        if (Array.isArray(json.teams) && json.teams.length) {
          setTeams(json.teams);
          setProjects(buildProjects(json.teams));
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to load team registry. Showing cached snapshot.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalMembers = useMemo(
    () => teams.reduce((sum, team) => sum + (team.members || 0), 0),
    [teams]
  );
  const avgPerformance = useMemo(() => {
    if (!teams.length) return 0;
    const total = teams.reduce((sum, team) => sum + (team.performance || 0), 0);
    return Math.round(total / teams.length);
  }, [teams]);
  const activeProjects = useMemo(() => projects.length, [projects]);

  const activeRoster = useMemo(() => {
    if (selectedTeam === "all") return [];
    const team = teams.find((t) => t.id === selectedTeam);
    return team?.roster || [];
  }, [selectedTeam, teams]);

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="bg-[#0f1630] border-b border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">👥 Team Management</h1>
              <p className="text-white/60">Organize teams, assign projects, and track performance</p>
            </div>
            <div className="flex items-center gap-3">
              {loading && (
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs uppercase tracking-[0.25em]">
                  Syncing…
                </span>
              )}
              <Link href="/dashboard/employees" className="btn btn-ghost">
                ← Back
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/dashboard/employees/team/new")}
              >
                + Create Team
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Teams</span>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-2xl font-bold">{teams.length}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Team Members</span>
                <span className="text-2xl">👤</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{totalMembers}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Active Projects</span>
                <span className="text-2xl">📁</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{activeProjects}</div>
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
          {/* Teams Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {teams.map((team) => (
              <div
                key={team.id}
                className="card hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedTeam(team.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{
                    team.department === "Operations" ? "⚙️" :
                    team.department === "Sales" ? "💼" :
                    team.department === "Analytics" ? "📊" :
                    team.department === "Engineering" ? "💻" : "🎧"
                  }</div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Active
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                <p className="text-sm text-white/60 mb-4">{team.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Team Lead:</span>
                    <span className="font-medium">{team.lead}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Members:</span>
                    <span className="font-medium">{team.members}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Projects:</span>
                    <span className="font-medium">{team.projects}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/60">Performance</span>
                    <span className="font-medium">{team.performance}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                      style={{width: `${team.performance}%`}}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedTeam(team.id);
                    }}
                    className="btn btn-primary text-sm flex-1"
                  >
                    View Team
                  </button>
                  <button
                    className="btn btn-ghost text-sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/dashboard/employees/team/${team.id}?mode=edit`);
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Active Projects */}
          <div className="card mb-8">
            <h3 className="text-2xl font-bold mb-6">Active Projects</h3>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg">{project.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === "ahead" ? "bg-green-500/20 text-green-400" :
                          project.status === "on-track" ? "bg-blue-500/20 text-blue-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {project.status === "ahead" ? "✓ Ahead" :
                           project.status === "on-track" ? "→ On Track" :
                           "⚠ At Risk"}
                        </span>
                      </div>
                      <div className="text-sm text-white/60">
                        Team: {project.team} • Deadline: {project.deadline}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{project.progress}%</div>
                      <div className="text-xs text-white/60">Complete</div>
                    </div>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        project.status === "ahead" ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                        project.status === "on-track" ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                        "bg-gradient-to-r from-red-500 to-orange-500"
                      }`}
                      style={{width: `${project.progress}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Details Modal (if team selected) */}
          {selectedTeam !== "all" && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {teams.find(t => t.id === selectedTeam)?.name} - Members
                </h3>
                <button 
                  onClick={() => setSelectedTeam("all")}
                  className="btn btn-ghost text-sm"
                >
                  Close
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {activeRoster.map((member, idx) => (
                  <div key={idx} className="bg-black/20 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold mb-1">{member.name}</div>
                      <div className="text-sm text-white/60 flex items-center gap-2">
                        <span>{member.role}</span>
                        <span>•</span>
                        <span className={
                          member.status === "active" ? "text-green-400" :
                          member.status === "away" ? "text-yellow-400" : "text-gray-400"
                        }>
                          {member.status === "active" ? "🟢 Active" :
                           member.status === "away" ? "🟡 Away" : "⚪ Offline"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Link href="/dashboard/employees/departments" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">🏢</div>
              <div className="font-bold mb-2">Departments</div>
              <div className="text-sm text-white/60">Manage department structure</div>
            </Link>

            <Link href="/dashboard/employees/access" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">🔐</div>
              <div className="font-bold mb-2">Access Control</div>
              <div className="text-sm text-white/60">Team permissions</div>
            </Link>

            <Link href="/dashboard/employees/activity" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">📊</div>
              <div className="font-bold mb-2">Team Analytics</div>
              <div className="text-sm text-white/60">Performance insights</div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
