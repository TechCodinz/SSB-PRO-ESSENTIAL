"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { hasPermission, ROLE_INFO, getAssignableRoles, ROLES, type Role } from "@/lib/roles"
import axios from "axios"
import toast from "react-hot-toast"

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<Role>('USER')
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<Role>('USER')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const { data } = await axios.get('/api/team')
      setTeamMembers(data.members)
      setCurrentUserRole(data.currentUserRole)
    } catch (error) {
      console.error('Failed to fetch team:', error)
    }
  }

  const canInvite = hasPermission(currentUserRole, 'team:invite')
  const canManageRoles = hasPermission(currentUserRole, 'team:manage_roles')
  const canRemove = hasPermission(currentUserRole, 'team:remove')

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/api/team/invite', {
        email: inviteEmail,
        role: inviteRole
      })
      
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail("")
      fetchTeamMembers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await axios.patch(`/api/team/${userId}`, { role: newRole })
      toast.success('Role updated successfully')
      fetchTeamMembers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update role')
    }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      await axios.delete(`/api/team/${userId}`)
      toast.success('Team member removed')
      fetchTeamMembers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove member')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">👥 Team Management</h1>
          <p className="text-white/60">
            Manage your team members and their roles with enterprise-grade access control
          </p>
        </div>

        {/* Invite Section */}
        {canInvite && (
          <div className="bg-[#0f1630] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">✉️ Invite Team Member</h2>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                    placeholder="colleague@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                  >
                    {getAssignableRoles(currentUserRole).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_INFO[role].icon} {ROLE_INFO[role].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Sending Invitation...' : '📧 Send Invitation'}
              </button>
            </form>
          </div>
        )}

        {/* Team Members List */}
        <div className="bg-[#0f1630] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Team Members ({teamMembers.length})</h2>

          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-black/20 border border-white/10 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                    {ROLE_INFO[member.role as Role]?.icon || '👤'}
                  </div>
                  
                  <div>
                    <div className="font-semibold">{member.name || member.email}</div>
                    <div className="text-sm text-white/60">{member.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded">
                        {ROLE_INFO[member.role as Role]?.name || member.role}
                      </span>
                      <span className="text-xs text-white/40">
                        Joined {new Date(member.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {canManageRoles && (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                      className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm"
                    >
                      {getAssignableRoles(currentUserRole).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_INFO[role].name}
                        </option>
                      ))}
                    </select>
                  )}

                  {canRemove && member.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            {teamMembers.length === 0 && (
              <div className="text-center py-12 text-white/40">
                No team members yet. Invite your first colleague!
              </div>
            )}
          </div>
        </div>

        {/* Role Legend */}
        <div className="bg-[#0f1630] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">📋 Role Descriptions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ROLE_INFO).map(([role, info]) => (
              <div
                key={role}
                className="bg-black/20 border border-white/10 rounded-lg p-4"
              >
                <div className="text-2xl mb-2">{info.icon}</div>
                <div className="font-semibold mb-1">{info.name}</div>
                <div className="text-sm text-white/60">{info.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
