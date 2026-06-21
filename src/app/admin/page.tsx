import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminPanel from '@/components/AdminPanel'
import { ArrowLeft } from '@/components/icons'

type User = {
  id: string
  full_name: string | null
  email: string
  role: string
  is_active: boolean
  created_at: string
  company: string | null
  team: string | null
  job_title: string | null
  hire_date: string | null
  end_date: string | null
  notes: string | null
  annual_riposi_days: number
  annual_permessi_days: number
}
type App = { id: string; name: string; slug: string; icon: string; color: string }
type Permission = { user_id: string; app_id: string }

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

  let adminError: string | null = null
  let users: User[] = []
  let apps: App[] = []
  let permissions: Permission[] = []

  try {
    const admin = createAdminClient()

    const [{ data: usersData, error: usersError }, { data: appsData, error: appsError }, { data: permsData, error: permsError }] = await Promise.all([
      admin.from('profiles').select('id, full_name, email, role, is_active, created_at, company, team, job_title, hire_date, end_date, notes, annual_riposi_days, annual_permessi_days').order('created_at'),
      admin.from('apps').select('id, name, slug, icon, color').eq('is_active', true),
      admin.from('user_app_permissions').select('user_id, app_id'),
    ])

    if (usersError || appsError || permsError) {
      const err = usersError ?? appsError ?? permsError
      console.error('[admin] query error:', err)
      adminError = err!.message
    } else {
      users = (usersData as User[]) ?? []
      apps = (appsData as App[]) ?? []
      permissions = (permsData as Permission[]) ?? []
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[admin] createAdminClient error:', msg)
    adminError = msg
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center gap-3 sticky top-0 z-10">
        <a
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </a>
        <span className="text-gray-200">|</span>
        <h1 className="text-sm font-semibold text-gray-900">Pannello Admin</h1>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {adminError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            Errore di configurazione: {adminError}
          </div>
        )}

        <AdminPanel users={users} apps={apps} permissions={permissions} />
      </main>
    </div>
  )
}
