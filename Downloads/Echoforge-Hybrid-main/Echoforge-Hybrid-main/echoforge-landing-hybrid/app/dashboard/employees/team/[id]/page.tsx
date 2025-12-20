"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import toast from "react-hot-toast";

type TeamDetail = {
  id: string;
  name: string;
  lead: string;
  department: string;
  members: number | null;
  description: string;
};

export default function EditTeamPage() {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "edit" ? "edit" : "view";

  const teamId = useMemo(() => {
    const id = params?.id;
    if (Array.isArray(id)) return id[0];
    return id ?? "";
  }, [params]);

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const formState = useMemo(() => {
    if (!team) {
      return {
        name: "",
        lead: "",
        department: "",
        members: "" as number | "",
        description: "",
      };
    }
    return {
      name: team.name || "",
      lead: team.lead || "",
      department: team.department || "",
      members: typeof team.members === "number" ? team.members : "",
      description: team.description || "",
    };
  }, [team]);

  const [form, setForm] = useState(formState);

  useEffect(() => {
    setForm(formState);
  }, [formState]);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) {
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/admin/employees/teams/${teamId}`, { cache: "no-store" });
        if (response.status === 401) {
          toast.error("Admin access required to manage teams.");
          router.push("/dashboard/employees");
          return;
        }
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.error || "Unable to load team");
        }

        const json = (await response.json()) as { team: TeamDetail };
        setTeam(json.team);
      } catch (error: any) {
        toast.error(error?.message || "Unable to load team right now");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, router]);

  const handleChange = (key: keyof typeof form) =>
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
    if (!teamId) return;

    if (!form.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/employees/teams/${teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          members: typeof form.members === "number" ? form.members : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Unable to update team");
      }

      toast.success("Team updated successfully");
      router.push("/dashboard/employees/team");
    } catch (error: any) {
      toast.error(error?.message || "Unable to update team right now");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {mode === "edit" ? "✏️ Edit Team" : "👀 Team Overview"}
          </h1>
          <p className="text-white/60">
            {mode === "edit"
              ? "Adjust the team’s mission profile, roster, and reporting lines."
              : "Review the configuration and performance details for this team."}
          </p>
        </div>

        {loading ? (
          <div className="card p-6 text-white/60">Loading team details...</div>
        ) : !team ? (
          <div className="card p-6 text-white/60">Team not found.</div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="team-name">
                Team Name
              </label>
              <input
                id="team-name"
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none disabled:opacity-50"
                value={form.name}
                onChange={handleChange("name")}
                disabled={mode !== "edit"}
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
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none disabled:opacity-50"
                  value={form.lead}
                  onChange={handleChange("lead")}
                  disabled={mode !== "edit"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="team-department">
                  Department
                </label>
                <input
                  id="team-department"
                  type="text"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none disabled:opacity-50"
                  value={form.department}
                  onChange={handleChange("department")}
                  disabled={mode !== "edit"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="team-members">
                Team Size
              </label>
              <input
                id="team-members"
                type="number"
                min={0}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none disabled:opacity-50"
                value={form.members}
                onChange={handleChange("members")}
                disabled={mode !== "edit"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="team-description">
                Mission Details
              </label>
              <textarea
                id="team-description"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:border-purple-500 focus:outline-none disabled:opacity-50"
                rows={4}
                value={form.description}
                onChange={handleChange("description")}
                disabled={mode !== "edit"}
              />
            </div>

            <div className="flex justify-between items-center gap-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => router.push("/dashboard/employees/team")}
              >
                Back to Teams
              </button>
              {mode === "edit" && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
