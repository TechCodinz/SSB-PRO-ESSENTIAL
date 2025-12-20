"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import toast from "react-hot-toast";

type DepartmentPayload = {
  name: string;
  lead: string;
  budget: string;
  description: string;
};

export default function NewDepartmentPage() {
  const router = useRouter();
  const [form, setForm] = useState<DepartmentPayload>({
    name: "",
    lead: "",
    budget: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof DepartmentPayload) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/employees/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Unable to create department");
      }

      toast.success("Department created successfully");
      router.push("/dashboard/employees/departments");
    } catch (error: any) {
      toast.error(error?.message || "Unable to create department right now");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">🏢 Create Department</h1>
          <p className="text-white/60">
            Define a new department, assign a leader, and set the initial budget envelope.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="dept-name">
              Department Name
            </label>
            <input
              id="dept-name"
              type="text"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Strategic Operations"
              value={form.name}
              onChange={handleChange("name")}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="dept-lead">
                Department Lead
              </label>
              <input
                id="dept-lead"
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. Alex Johnson"
                value={form.lead}
                onChange={handleChange("lead")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="dept-budget">
                Budget (annual)
              </label>
              <input
                id="dept-budget"
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-blue-500 focus:outline-none"
                placeholder="$500000"
                value={form.budget}
                onChange={handleChange("budget")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="dept-description">
              Mission Statement
            </label>
            <textarea
              id="dept-description"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-blue-500 focus:outline-none"
              rows={4}
              placeholder="What objectives will this department drive?"
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push("/dashboard/employees/departments")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Department"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
