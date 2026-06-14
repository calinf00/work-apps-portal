'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type User = { id: string; full_name: string | null; email: string; role: string; is_active: boolean; created_at: string }
type App = { id: string; name: string; slug: string; icon: string; color: string }
type Permission = { user_id: string; app_id: string }

export default function AdminPanel({
  users,
  apps,
  permissions,
}: {
  users: User[]
  apps: App[]
  permissions: Permission[]
}) {
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
      await supabase
        .from('user_app_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('app_id', appId)
    } else {
      await supabase
        .from('user_app_permissions')
        .insert({ user_id: userId, app_id: appId })
    }
    router.refresh()
  }

  async function toggleActive(userId: string, current: boolean) {
    await supabase
      .from('profiles')
      .update({ is_active: !current })
      .eq('id', userId)
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
    <div className="flex flex-col gap-10">
      {/* Crea utente */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Crea nuovo utente</h2>
        <form onSubmit={createUser} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 max-w-lg">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mario Rossi"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="mario@azienda.it"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password temporanea</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          {message && (
            <p className={`text-sm px-3 py-2 rounded-lg ${message.startsWith('Errore') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={creating}
            className="self-start bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creazione...' : 'Crea utente'}
          </button>
        </form>
      </section>

      {/* Gestione utenti e permessi */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Utenti e permessi</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Utente</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Ruolo</th>
                {apps.map(app => (
                  <th key={app.id} className="text-center px-4 py-3 font-medium text-gray-600">
                    {app.icon} {app.name}
                  </th>
                ))}
                <th className="text-center px-4 py-3 font-medium text-gray-600">Attivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900">{user.full_name || '—'}</div>
                    <div className="text-gray-400 text-xs">{user.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  {apps.map(app => (
                    <td key={app.id} className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePermission(user.id, app.id)}
                        className={`w-6 h-6 rounded-full border-2 transition-colors ${
                          hasPermission(user.id, app.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300 hover:border-blue-400'
                        }`}
                        title={hasPermission(user.id, app.id) ? 'Rimuovi accesso' : 'Concedi accesso'}
                      >
                        {hasPermission(user.id, app.id) && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </button>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(user.id, user.is_active)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        user.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        user.is_active ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
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
