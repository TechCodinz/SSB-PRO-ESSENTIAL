"use client";

import useSWR from "swr";
import { useState } from "react";
import toast from "react-hot-toast";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import Link from "next/link";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

const PLAN_OPTIONS = [
  { value: "FREE", label: "Free" },
  { value: "STARTER", label: "Starter" },
  { value: "PRO", label: "Pro" },
  { value: "ENTERPRISE", label: "Enterprise" },
];

type PlanPayload = {
  id: string;
  plan: string | null;
  slug: string;
  name: string;
  priceCents: number;
  description?: string | null;
  features: string[];
  analysesLimit?: number | null;
  rowsLimit?: number | null;
  apiCallsLimit?: number | null;
  isActive: boolean;
  memberCount: number;
};

const emptyPlan = {
  name: "",
  slug: "",
  planKey: "",
  priceDollars: "0",
  description: "",
  featuresText: "",
  analysesLimit: "",
  rowsLimit: "",
  apiCallsLimit: "",
  isActive: true,
};

export default function AdminPlansPage() {
  const { data, isLoading, mutate } = useSWR("/api/admin/plans", fetcher);
  const plans: PlanPayload[] = data?.plans ?? [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ ...emptyPlan });

  const startEdit = (plan: PlanPayload) => {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      slug: plan.slug,
      planKey: plan.plan ?? "",
      priceDollars: (plan.priceCents / 100).toString(),
      description: plan.description ?? "",
      featuresText: plan.features.join("\n"),
      analysesLimit: plan.analysesLimit?.toString() ?? "",
      rowsLimit: plan.rowsLimit?.toString() ?? "",
      apiCallsLimit: plan.apiCallsLimit?.toString() ?? "",
      isActive: plan.isActive,
    });
  };

  const resetForm = () => {
    setForm({ ...emptyPlan });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSubmit = async (planId?: string) => {
    const priceCents = Math.round(parseFloat(form.priceDollars || "0") * 100);
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      planKey: form.planKey || null,
      priceCents,
      description: form.description,
      features: form.featuresText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
      analysesLimit: form.analysesLimit ? parseInt(form.analysesLimit, 10) : null,
      rowsLimit: form.rowsLimit ? parseInt(form.rowsLimit, 10) : null,
      apiCallsLimit: form.apiCallsLimit ? parseInt(form.apiCallsLimit, 10) : null,
      isActive: form.isActive,
    };

    try {
      if (planId) {
        const res = await fetch(`/api/admin/plans/${planId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Update failed");
        toast.success("Plan updated");
      } else {
        const res = await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Creation failed");
        toast.success("Plan created");
      }
      await mutate();
      resetForm();
    } catch (error: any) {
      toast.error(error.message ?? "Unable to save plan");
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Delete this plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
      toast.success("Plan deleted");
      mutate();
    } catch (error: any) {
      toast.error(error.message ?? "Unable to delete plan");
    }
  };

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">💳 Plan Management</h1>
              <p className="text-white/60">Configure pricing plans, limits, and availability.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/admin" className="btn btn-ghost">
                ← Back to Admin
              </Link>
              <button
                onClick={() => {
                  setIsCreating(true);
                  setEditingId(null);
                  setForm({ ...emptyPlan });
                }}
                className="btn btn-primary"
              >
                + Add Plan
              </button>
            </div>
          </div>

          {isLoading && <div className="text-white/50 text-sm">Loading plans…</div>}

          {isCreating && (
            <PlanForm
              title="Create Plan"
              form={form}
              onChange={setForm}
              onCancel={resetForm}
              onSubmit={() => handleSubmit()}
            />
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {plans.map((plan) =>
              editingId === plan.id ? (
                <PlanForm
                  key={plan.id}
                  title={`Edit ${plan.name}`}
                  form={form}
                  onChange={setForm}
                  onCancel={resetForm}
                  onSubmit={() => handleSubmit(plan.id)}
                  isCore={Boolean(plan.plan)}
                />
              ) : (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={() => startEdit(plan)}
                  onDelete={
                    plan.plan ? undefined : () => handleDelete(plan.id)
                  }
                />
              ),
            )}
            {!plans.length && !isLoading && (
              <div className="text-white/40 text-sm">No plans configured yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type PlanFormProps = {
  title: string;
  form: typeof emptyPlan;
  onChange: (value: typeof emptyPlan) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isCore?: boolean;
};

function PlanForm({ title, form, onChange, onSubmit, onCancel, isCore }: PlanFormProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button onClick={onCancel} className="text-sm text-white/50 hover:text-white">
          Cancel
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <label className="text-sm text-white/60">
          Plan Name
          <input
            className="mt-1 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            placeholder="Pro Plus"
          />
        </label>
        <label className="text-sm text-white/60">
          Slug
          <input
            className="mt-1 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            value={form.slug}
            onChange={(event) => onChange({ ...form, slug: event.target.value })}
            placeholder="pro-plus"
          />
        </label>
        <label className="text-sm text-white/60">
          Plan Enum (optional)
          <select
            className="mt-1 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            value={form.planKey}
            onChange={(event) => onChange({ ...form, planKey: event.target.value })}
            disabled={isCore}
          >
            <option value="">Custom</option>
            {PLAN_OPTIONS.map((plan) => (
              <option key={plan.value} value={plan.value}>
                {plan.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-white/60">
          Price (USD)
          <input
            className="mt-1 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            value={form.priceDollars}
            onChange={(event) => onChange({ ...form, priceDollars: event.target.value })}
            type="number"
            min="0"
            step="0.01"
          />
        </label>
      </div>
      <label className="text-sm text-white/60 block">
        Description
        <textarea
          className="mt-1 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white h-24"
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
        />
      </label>
      <label className="text-sm text-white/60 block">
        Features (one per line)
        <textarea
          className="mt-1 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white h-32"
          value={form.featuresText}
          onChange={(event) => onChange({ ...form, featuresText: event.target.value })}
        />
      </label>
      <div className="grid md:grid-cols-3 gap-4">
        <label className="text-sm text-white/60">
          Analyses Limit
          <input
            className="mt-1 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            value={form.analysesLimit}
            onChange={(event) => onChange({ ...form, analysesLimit: event.target.value })}
            type="number"
            min="0"
          />
        </label>
        <label className="text-sm text-white/60">
          Rows Limit
          <input
            className="mt-1 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            value={form.rowsLimit}
            onChange={(event) => onChange({ ...form, rowsLimit: event.target.value })}
            type="number"
            min="0"
          />
        </label>
        <label className="text-sm text-white/60">
          API Calls Limit
          <input
            className="mt-1 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
            value={form.apiCallsLimit}
            onChange={(event) => onChange({ ...form, apiCallsLimit: event.target.value })}
            type="number"
            min="0"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-white/60">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => onChange({ ...form, isActive: event.target.checked })}
          className="h-4 w-4 rounded border-white/20 bg-black/50"
        />
        Active plan
      </label>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        <button onClick={onSubmit} className="btn btn-primary">
          Save
        </button>
      </div>
    </div>
  );
}

type PlanCardProps = {
  plan: PlanPayload;
  onEdit: () => void;
  onDelete?: () => void;
};

function PlanCard({ plan, onEdit, onDelete }: PlanCardProps) {
  return (
    <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
          <p className="text-white/60 text-sm">{plan.description}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-400">
            ${(plan.priceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-white/50 uppercase">per month</div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className={`px-3 py-1 rounded-full ${plan.isActive ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}`}>
          {plan.isActive ? "Active" : "Disabled"}
        </span>
        {plan.plan && (
          <span className="px-3 py-1 rounded-full bg-white/10 text-white/70">Enum: {plan.plan}</span>
        )}
        <span className="text-white/40">Members: {plan.memberCount}</span>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white mb-2">Features</h4>
        <ul className="space-y-1 text-sm text-white/70">
          {plan.features.map((feature) => (
            <li key={feature}>• {feature}</li>
          ))}
          {!plan.features.length && <li>No features listed.</li>}
        </ul>
      </div>
      <div className="grid md:grid-cols-3 gap-3 text-xs text-white/60">
        <MetricTag label="Analyses" value={plan.analysesLimit ?? "Unlimited"} />
        <MetricTag label="Rows" value={plan.rowsLimit ?? "Unlimited"} />
        <MetricTag label="API Calls" value={plan.apiCallsLimit ?? "Unlimited"} />
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="btn btn-primary btn-sm flex-1">
          ⚙️ Edit
        </button>
        {onDelete && (
          <button onClick={onDelete} className="btn btn-ghost btn-sm">
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}

function MetricTag({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-center">
      <div className="text-xs text-white/40">{label}</div>
      <div className="text-sm font-semibold text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
