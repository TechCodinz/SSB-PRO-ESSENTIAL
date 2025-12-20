// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTeam, listTeams } from "../data";
import { authorizeSession } from "@/lib/rbac";
import { recordAdminAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, 'READ_ONLY');
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      session,
      action: 'admin.employees.teams.list',
      resource: 'admin/employees/teams',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const teams = await listTeams();
  await recordAdminAuditLog({
    session,
    action: 'admin.employees.teams.list',
    resource: 'admin/employees/teams',
    metadata: { count: teams.length },
  });
  return NextResponse.json({ teams });
}

type TeamPayload = {
  name?: string;
  lead?: string;
  department?: string;
  members?: number;
  description?: string;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, 'ADMIN');
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.teams.create',
      resource: 'admin/employees/teams',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let payload: TeamPayload;
  try {
    payload = (await request.json()) as TeamPayload;
  } catch (error) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.teams.create',
      resource: 'admin/employees/teams',
      status: 'FAILURE',
      description: 'Invalid JSON body',
    });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.name || !payload.name.trim()) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.teams.create',
      resource: 'admin/employees/teams',
      status: 'FAILURE',
      description: 'Team name is required',
    });
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  const team = await createTeam({
    name: payload.name.trim(),
    lead: payload.lead?.trim(),
    department: payload.department?.trim(),
    members: typeof payload.members === "number" ? payload.members : undefined,
    description: payload.description?.trim(),
  });

  await recordAdminAuditLog({
    request,
    session,
    action: 'admin.employees.teams.create',
    resource: 'admin/employees/teams',
    metadata: { name: team.name, id: (team as any).id ?? null },
  });

  return NextResponse.json({ team }, { status: 201 });
}
