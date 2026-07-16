'use client';

import { useState } from 'react';
import { Users, Plus, Mail, Shield, Check, Trash2 } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Developer' | 'Analyst';
  status: 'ACTIVE' | 'INVITED';
}

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Krishnan', email: 'krishnan@flowsphere.ai', role: 'Owner', status: 'ACTIVE' },
  { id: 'm2', name: 'Alex Johnson', email: 'alex@flowsphere.ai', role: 'Developer', status: 'ACTIVE' },
  { id: 'm3', name: 'Sara Miller', email: 'sara@flowsphere.ai', role: 'Analyst', status: 'INVITED' },
];

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Developer' | 'Analyst'>('Developer');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: Member = {
      id: `member-${Date.now()}`,
      name: inviteEmail.split('@')[0] || 'New User',
      email: inviteEmail,
      role: inviteRole,
      status: 'INVITED',
    };

    setMembers((prev) => [...prev, newMember]);
    setInviteEmail('');
  };

  const handleRemove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Team Members
        </h1>
        <p className="text-muted-foreground mt-1">Manage team access controls and invite collaborators to your workspace.</p>
      </div>

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="glass rounded-2xl p-5 space-y-4 max-w-2xl">
        <h3 className="text-sm font-semibold text-white">Invite new member</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="collaborator@company.com"
              required
              className="input-glass w-full pl-10 text-xs py-2.5"
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            className="rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-xs text-white sm:w-36 cursor-pointer"
          >
            <option value="Developer" className="bg-surface-1">Developer</option>
            <option value="Analyst" className="bg-surface-1">Analyst</option>
            <option value="Owner" className="bg-surface-1">Owner</option>
          </select>
          <button
            type="submit"
            className="btn-glow flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Send Invite
          </button>
        </div>
      </form>

      {/* Member List */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-white">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-white/[0.01] transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-white">{member.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{member.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    {member.role}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {member.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 border border-success/30 px-2 py-0.5 text-[10px] font-medium text-success">
                      <Check className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 border border-warning/30 px-2 py-0.5 text-[10px] font-medium text-warning">
                      Invited
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {member.role !== 'Owner' && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
