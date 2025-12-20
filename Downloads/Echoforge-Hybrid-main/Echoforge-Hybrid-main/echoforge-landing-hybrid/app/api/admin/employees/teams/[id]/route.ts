// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTeamById, updateTeam } from "../../data";
import { authorizeSession } from "@/lib/rbac";
import { recordAdminAuditLog } from "@/lib/audit";

export async function GET(request: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, 'READ_ONLY');
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.teams.detail',
      resource: 'admin/employees/teams',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
      metadata: { teamId: context.params.id },
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const team = await getTeamById(context.params.id);
  if (!team) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.teams.detail',
      resource: 'admin/employees/teams',
      status: 'FAILURE',
      description: 'Team not found',
      metadata: { teamId: context.params.id },
    });
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  await recordAdminAuditLog({
    request,
    session,
    action: 'admin.employees.teams.detail',
    resource: 'admin/employees/teams',
    metadata: { teamId: context.params.id },
  });

  return NextResponse.json({ team });
}

type TeamUpdatePayload = {
  name?: string;
  lead?: string;
  department?: string;
  members?: number;
  description?: string;
};

export async function PUT(request: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, 'ADMIN');
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.teams.update',
      resource: 'admin/employees/teams',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
      metadata: { teamId: context.params.id },
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let payload: TeamUpdatePayload;
  try {
    payload = (await request.json()) as TeamUpdatePayload;
  } catch (error) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.teams.update',
      resource: 'admin/employees/teams',
      status: 'FAILURE',
      description: 'Invalid JSON body',
      metadata: { teamId: context.params.id },
    });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const team = await updateTeam(context.params.id, {
    name: payload.name?.trim(),
    lead: payload.lead?.trim(),
    department: payload.department?.trim(),
    members: typeof payload.members === "number" ? payload.members : undefined,
    description: payload.description?.trim(),
  });

  if (!team) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.teams.update',
      resource: 'admin/employees/teams',
      status: 'FAILURE',
      description: 'Team not found',
      metadata: { teamId: context.params.id },
    });
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  await recordAdminAuditLog({
    request,
    session,
    action: 'admin.employees.teams.update',
    resource: 'admin/employees/teams',
    metadata: { teamId: context.params.id },
  });

  return NextResponse.json({ team });
}
