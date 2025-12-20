"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import toast from "react-hot-toast";

type TeamPayload = {
  name: string;
  lead: string;
  department: string;
  members: number | "";
  description: string;
};

export default function NewTeamPage() {
  const router = useRouter();
  const [form, setForm] = useState<TeamPayload>({
    name: "",
    lead: "",
    department: "",
    members: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof TeamPayload) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [key]:
          key === "members"
            ? value === ""
              ? ""
              : Number.isNaN(Number(value))
              ? prev.members
              : Number(value)
            : value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/employees/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          members: typeof form.members === "number" ? form.members : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Unable to create team");
      }

      toast.success("Team created successfully");
      router.push("/dashboard/employees/team");
    } catch (error: any) {
      toast.error(error?.message || "Unable to create team right now");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">👥 Create Team</h1>
          <p className="text-white/60">
            Spin up a new team, assign a lead, and describe the mission they will deliver.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="team-name">
              Team Name
            </label>
            <input
              id="team-name"
              type="text"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none"
              placeholder="e.g. Global Revenue Squad"
              value={form.name}
              onChange={handleChange("name")}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="team-lead">
                Team Lead
              </label>
              <input
                id="team-lead"
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none"
                placeholder="e.g. Jordan Patel"
                value={form.lead}
                onChange={handleChange("lead")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="team-department">
                Department
              </label>
              <input
                id="team-department"
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none"
                placeholder="e.g. Sales"
                value={form.department}
                onChange={handleChange("department")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="team-members">
              Estimated Team Size
            </label>
            <input
              id="team-members"
              type="number"
              min={0}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none"
              placeholder="5"
              value={form.members}
              onChange={handleChange("members")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="team-description">
              Mission Statement
            </label>
            <textarea
              id="team-description"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none"
              rows={4}
              placeholder="What objectives will this team own?"
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.push("/dashboard/employees/team")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Team"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
