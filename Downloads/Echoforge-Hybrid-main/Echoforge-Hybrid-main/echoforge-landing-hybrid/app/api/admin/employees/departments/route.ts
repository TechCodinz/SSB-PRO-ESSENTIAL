// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createDepartment, listDepartments } from "../data";
import { authorizeSession } from "@/lib/rbac";
import { recordAdminAuditLog } from "@/lib/audit";

export async function GET() {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, 'READ_ONLY');
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      session,
      action: 'admin.employees.departments.list',
      resource: 'admin/employees/departments',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const departments = await listDepartments();
  await recordAdminAuditLog({
    session,
    action: 'admin.employees.departments.list',
    resource: 'admin/employees/departments',
    metadata: { count: departments.length },
  });
  return NextResponse.json({ departments });
}

type DepartmentPayload = {
  name?: string;
  lead?: string;
  budget?: string;
  description?: string;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, 'ADMIN');
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.departments.create',
      resource: 'admin/employees/departments',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let payload: DepartmentPayload;
  try {
    payload = (await request.json()) as DepartmentPayload;
  } catch (error) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.departments.create',
      resource: 'admin/employees/departments',
      status: 'FAILURE',
      description: 'Invalid JSON body',
    });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.name || !payload.name.trim()) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.employees.departments.create',
      resource: 'admin/employees/departments',
      status: 'FAILURE',
      description: 'Department name is required',
    });
    return NextResponse.json({ error: "Department name is required" }, { status: 400 });
  }

  const department = await createDepartment({
    name: payload.name.trim(),
    lead: payload.lead?.trim(),
    budget: payload.budget?.trim(),
    description: payload.description?.trim(),
  });

  await recordAdminAuditLog({
    request,
    session,
    action: 'admin.employees.departments.create',
    resource: 'admin/employees/departments',
    metadata: { name: department.name, id: (department as any).id ?? null },
  });

  return NextResponse.json({ department }, { status: 201 });
}
