'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type User = { id: string; full_name: string | null; email: string; role: string; is_active: boolean; created_at: string }
type App = { id: string; name: string; slug: string; icon: string; color: string }
type Permission = { user_id: string; app_id: string }

export default function AdminPanel({ users, apps, permissions }: { users: User[]; apps: App[]; permissions: Permission[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')

  function hasPermission(userId: string, appId: string) {
    return permissions.some(p => p.user_id === userId && p.app_id === appId)
  }

  async function togglePermission(userId: string, appId: string) {
    if (hasPermission(userId, appId)) {
      await supabase.from('user_app_permissions').delete().eq('user_id', userId).eq('app_id', appId)
    } else {
      await supabase.from('user_app_permissions').insert({ user_id: userId, app_id: appId })
    }
    router.refresh()
  }

  async function toggleActive(userId: string, current: boolean) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', userId)
    router.refresh()
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setMessage('')
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, password: newPassword, full_name: newName }),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage('Utente creato con successo.')
      setNewEmail('')
      setNewName('')
      setNewPassword('')
      router.refresh()
    } else {
      setMessage(`Errore: ${data.error}`)
    }
    setCreating(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Crea nuovo utente</h2>
        <form onSubmit={createUser} className="bg-white rounded-2xl border border-gray-100 p-6 max-w-xl">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Nome</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-colors"
                placeholder="Mario Rossi"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-colors"
                placeholder="mario@azienda.it"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Password temporanea</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-colors"
              placeholder="••••••••"
            />
          </div>
          {message && (
            <p className={`text-sm px-4 py-2.5 rounded-xl mb-4 ${message.startsWith('Errore') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={creating}
            className="bg-slate-900 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {creating ? 'Creazione...' : 'Crea utente'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Utenti e permessi</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Utente</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Ruolo</th>
                {apps.map(app => (
                  <th key={app.id} className="text-center px-4 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {app.icon} {app.name}
                  </th>
                ))}
                <th className="text-center px-4 py-3.5 text-xs font-medium text-gray-400 uppercase tracking-wide">Attivo</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {(user.full_name || user.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{user.full_name || '—'}</div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-lg font-medium ${
                      user.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  {apps.map(app => (
                    <td key={app.id} className="px-4 py-4 text-center">
                      <button
                        onClick={() => togglePermission(user.id, app.id)}
                        title={hasPermission(user.id, app.id) ? 'Rimuovi accesso' : 'Concedi accesso'}
                        className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto transition-all text-xs ${
                          hasPermission(user.id, app.id)
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {hasPermission(user.id, app.id) ? '✓' : ''}
                      </button>
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => toggleActive(user.id, user.is_active)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${user.is_active ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${user.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
