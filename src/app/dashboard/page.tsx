import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const { data: permissions } = await supabase
    .from('user_app_permissions')
    .select('app_id, apps(name, description, url, icon, color, slug)')
    .eq('user_id', user.id)

  const apps = permissions?.map(p => p.apps).filter(Boolean) ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Work Apps</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {profile?.full_name || user.email}
          </span>
          {profile?.role === 'admin' && (
            <a
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Pannello Admin
            </a>
          )}
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Le tue applicazioni</h2>

        {apps.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Nessuna applicazione disponibile.</p>
            <p className="text-sm mt-1">Contatta l&apos;amministratore per richiedere l&apos;accesso.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app: any) => (
              <a
                key={app.slug}
                href={app.url || '#'}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer block"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: app.color + '20' }}
                >
                  {app.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{app.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{app.description}</p>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
