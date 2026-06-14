import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminPanel from '@/components/AdminPanel'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ data: users }, { data: apps }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, role, is_active, created_at').order('created_at'),
    supabase.from('apps').select('id, name, slug, icon, color').eq('is_active', true),
  ])

  const { data: permissions } = await supabase
    .from('user_app_permissions')
    .select('user_id, app_id')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</a>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-bold text-gray-900">Pannello Admin</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <AdminPanel
          users={users ?? []}
          apps={apps ?? []}
          permissions={permissions ?? []}
        />
      </main>
    </div>
  )
}
