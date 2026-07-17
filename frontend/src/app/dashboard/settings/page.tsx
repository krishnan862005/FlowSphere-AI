'use client';

import { Settings, User, Bell, Shield, Trash2, Save } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? 'Test User');
  const [email, setEmail] = useState(user?.email ?? 'test@example.com');
  const [emailNotif, setEmailNotif] = useState(true);
  const [failureNotif, setFailureNotif] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    if (typeof window !== 'undefined' && (window as any).__toast) {
      (window as any).__toast({ type: 'success', title: 'Settings saved successfully' });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">Configure your personal preferences, notifications, and security settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Settings categories navigation */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 px-3.5 py-3 text-sm font-semibold text-primary">
            <User className="h-4.5 w-4.5" />
            General Profile
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
            <Bell className="h-4.5 w-4.5" />
            Notifications
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-muted-foreground hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
            <Shield className="h-4.5 w-4.5" />
            Security & MFA
          </div>
        </div>

        {/* Settings panels */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="glass rounded-2xl p-6 space-y-6">
            <h2 className="text-base font-semibold text-white border-b border-white/5 pb-3">Account Details</h2>

            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-glass w-full text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass w-full text-xs py-2"
                />
              </div>
            </div>

            <h2 className="text-base font-semibold text-white border-b border-white/5 pb-3 pt-4">Notification Preferences</h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-white">Execution Success Reports</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Receive daily summary emails about your successful runs</div>
                </div>
                <div
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${emailNotif ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${emailNotif ? 'translate-x-4' : ''}`} />
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-medium text-white">Failure Alerts</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Instant alerts when any automation fails</div>
                </div>
                <div
                  onClick={() => setFailureNotif(!failureNotif)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${failureNotif ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${failureNotif ? 'translate-x-4' : ''}`} />
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-glow flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>

          {/* Danger zone */}
          <div className="glass rounded-2xl p-6 border-red-500/20 bg-red-500/2">
            <h2 className="text-base font-semibold text-red-400 border-b border-white/5 pb-3">Danger Zone</h2>
            <p className="text-xs text-muted-foreground mt-3">Once deleted, your account and all configured workflows will be permanently erased. This action is irreversible.</p>
            <button className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 hover:text-white transition-all">
              <Trash2 className="h-3.5 w-3.5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
