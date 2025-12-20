import { prisma } from "@/lib/db";

const now = () => new Date().toISOString();

export type KpiRecord = { name: string; value: string; trend: string };

export type DepartmentRecord = {
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
  details: {
    kpis: KpiRecord[];
    teams: string[];
    projects: string[];
  };
  createdAt: string;
  updatedAt: string;
};

export type TeamRecord = {
  id: string;
  name: string;
  lead: string;
  members: number;
  projects: number;
  performance: number;
  status: "active" | "paused" | "archived";
  department: string;
  description: string;
  roster: Array<{ name: string; role: string; status: "active" | "away" | "offline" }>;
  createdAt: string;
  updatedAt: string;
};

type DepartmentSeed = Omit<DepartmentRecord, "teams" | "createdAt" | "updatedAt"> & {
  teams: number;
  createdAt?: string;
  updatedAt?: string;
};

type TeamSeed = Omit<TeamRecord, "createdAt" | "updatedAt"> & {
  departmentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

const DEFAULT_DEPARTMENTS: DepartmentSeed[] = [
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

const DEFAULT_TEAMS: TeamSeed[] = [
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
    department: "Data Analytics",
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
    department: "Customer Support",
    description: "Customer support and success",
    roster: [
      { name: "Emma Davis", role: "Support", status: "active" },
      { name: "Henry Wilson", role: "Support", status: "active" },
      { name: "Olivia Brown", role: "Support", status: "active" },
      { name: "Daniel Garcia", role: "Support", status: "active" },
    ],
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);

const mapDepartmentFromPrisma = (department: any): DepartmentRecord => {
  const metrics = (department.metrics as any) || {};
  const teams = department.teams?.length ?? 0;
  return {
    id: department.id,
    name: department.name,
    icon: department.icon,
    color: department.color,
    lead: department.leadName ?? "Unassigned",
    members: department.membersCount,
    teams,
    budget: department.budgetLabel ?? "$0",
    performance: department.performance,
    description: department.description ?? "",
    details: {
      kpis: Array.isArray(metrics.kpis) ? metrics.kpis : [],
      teams: Array.isArray(metrics.teams) ? metrics.teams : [],
      projects: Array.isArray(metrics.projects) ? metrics.projects : [],
    },
    createdAt: department.createdAt.toISOString(),
    updatedAt: department.updatedAt.toISOString(),
  };
};

const mapTeamFromPrisma = (team: any): TeamRecord => {
  const roster = (team.roster as any) || [];
  const status = team.status.toLowerCase() as TeamRecord["status"];
  return {
    id: team.id,
    name: team.name,
    lead: team.leadName ?? "Unassigned",
    members: team.membersCount,
    projects: team.projectsCount,
    performance: team.performance,
    status,
    department: team.department?.name ?? team.departmentName ?? "Unassigned",
    description: team.description ?? "",
    roster: Array.isArray(roster) ? roster : [],
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
  };
};

async function ensureDepartmentsSeeded() {
  const db = prisma as any;
  const count = await db.department.count();
  if (count > 0) return;

  await db.$transaction(
    DEFAULT_DEPARTMENTS.map((record) =>
      db.department.create({
        data: {
          id: record.id,
          name: record.name,
          slug: slugify(record.name),
          description: record.description,
          leadName: record.lead,
          budgetLabel: record.budget,
          icon: record.icon,
          color: record.color,
          membersCount: record.members,
          performance: record.performance,
          metrics: record.details,
          createdAt: new Date(record.createdAt ?? now()),
          updatedAt: new Date(record.updatedAt ?? now()),
        },
      })
    )
  );
}

async function ensureTeamsSeeded() {
  const db = prisma as any;
  const count = await db.team.count();
  if (count > 0) return;

  const departments = await db.department.findMany({ select: { id: true, name: true } });
  const departmentLookup = new Map(departments.map((dept: { id: string; name: string }) => [dept.name.toLowerCase(), dept.id]));

  await db.$transaction(
    DEFAULT_TEAMS.map((record) =>
      db.team.create({
        data: {
          id: record.id,
          name: record.name,
          leadName: record.lead,
          description: record.description,
          membersCount: record.members,
          projectsCount: record.projects,
          performance: record.performance,
          status: "ACTIVE",
          departmentId: departmentLookup.get(record.department.toLowerCase()) ?? null,
          departmentName: record.department,
          roster: record.roster,
          icon: "👥",
          color: "from-blue-500/20 to-purple-500/20",
          createdAt: new Date(record.createdAt ?? now()),
          updatedAt: new Date(record.updatedAt ?? now()),
        },
      })
    )
  );
}

export async function listDepartments(): Promise<DepartmentRecord[]> {
  const db = prisma as any;
  await ensureDepartmentsSeeded();
  const departments = await db.department.findMany({
    include: { teams: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  return departments.map(mapDepartmentFromPrisma);
}

export async function createDepartment(input: {
  name: string;
  lead?: string;
  budget?: string;
  description?: string;
}): Promise<DepartmentRecord> {
  const db = prisma as any;
  const name = input.name.trim();
  const slug = slugify(name);

  const department = await db.department.create({
    data: {
      name,
      slug,
      description: input.description?.trim(),
      leadName: input.lead?.trim(),
      budgetLabel: input.budget?.trim(),
      metrics: {
        kpis: [],
        teams: [],
        projects: [],
      },
    },
    include: { teams: { select: { id: true } } },
  });

  return mapDepartmentFromPrisma(department);
}

export async function listTeams(): Promise<TeamRecord[]> {
  const db = prisma as any;
  await ensureDepartmentsSeeded();
  await ensureTeamsSeeded();

  const teams = await db.team.findMany({
    include: { department: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return teams.map(mapTeamFromPrisma);
}

export async function getTeamById(id: string): Promise<TeamRecord | null> {
  const db = prisma as any;
  const team = await db.team.findUnique({
    where: { id },
    include: { department: { select: { name: true } } },
  });
  return team ? mapTeamFromPrisma(team) : null;
}

export async function createTeam(input: {
  name: string;
  lead?: string;
  department?: string;
  members?: number;
  description?: string;
}): Promise<TeamRecord> {
  const db = prisma as any;
  const cleanedName = input.name.trim();
  const departmentName = input.department?.trim();
  let departmentId: string | undefined;

  if (departmentName) {
    const existing = await db.department.findFirst({
      where: { name: { equals: departmentName, mode: "insensitive" } },
      select: { id: true },
    });
    departmentId = existing?.id;
  }

  const team = await db.team.create({
    data: {
      name: cleanedName,
      leadName: input.lead?.trim(),
      description: input.description?.trim(),
      membersCount: input.members ?? 0,
      departmentId: departmentId ?? null,
      departmentName: departmentName ?? (departmentId ? undefined : "Unassigned"),
      roster: [],
    },
    include: { department: { select: { name: true } } },
  });

  return mapTeamFromPrisma(team);
}

export async function updateTeam(inputId: string, input: {
  name?: string;
  lead?: string;
  department?: string;
  members?: number;
  description?: string;
}): Promise<TeamRecord | null> {
  const db = prisma as any;
  const departmentName = input.department?.trim();
  let departmentId: string | undefined | null = undefined;

  if (departmentName !== undefined) {
    if (!departmentName) {
      departmentId = null;
    } else {
      const existing = await db.department.findFirst({
        where: { name: { equals: departmentName, mode: "insensitive" } },
        select: { id: true },
      });
      departmentId = existing?.id ?? null;
    }
  }

  const team = await db.team.update({
    where: { id: inputId },
    data: {
      name: input.name?.trim(),
      leadName: input.lead?.trim(),
      description: input.description?.trim(),
      membersCount: input.members ?? undefined,
      departmentId: departmentId,
      departmentName: departmentName === undefined ? undefined : departmentName || "Unassigned",
    },
    include: { department: { select: { name: true } } },
  });

  return mapTeamFromPrisma(team);
}
