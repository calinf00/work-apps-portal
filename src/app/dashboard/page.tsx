import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'
import { Bolt, Squares } from '@/components/icons'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[dashboard] failed to load profile:', profileError)
  }

  const isAdmin = profile?.role === 'admin'

  const [permRes, appsRes] = await Promise.all([
    isAdmin
      ? Promise.resolve({ data: null, error: null })
      : supabase
          .from('user_app_permissions')
          .select('app_id, apps(name, description, url, icon, color, slug)')
          .eq('user_id', user.id),
    isAdmin
      ? supabase.from('apps').select('name, description, url, icon, color, slug').eq('is_active', true)
      : Promise.resolve({ data: null, error: null }),
  ])

  if (permRes.error) console.error('[dashboard] failed to load permissions:', permRes.error)
  if (appsRes.error) console.error('[dashboard] failed to load apps:', appsRes.error)

  // Supabase returns the embedded `apps` relation either as an object or a
  // single-element array depending on the inferred cardinality; normalize both.
  const apps = isAdmin
    ? (appsRes.data ?? [])
    : ((permRes.data ?? [])
        .flatMap(p => (Array.isArray(p.apps) ? p.apps : p.apps ? [p.apps] : [])))
  const displayName = profile?.full_name || user.email || ''
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Bolt className="w-4 h-4 text-white" /></div>
          <span className="font-semibold text-gray-900 text-sm">Work Apps</span>
        </div>
        <div className="flex items-center gap-2">
          {profile?.role === 'admin' && (
            <a href="/admin" className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
              Admin
            </a>
          )}
          <div className="flex items-center gap-2 ml-1">
            <div className="w-7 h-7 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white text-xs font-semibold select-none">
              {initials}
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">
            Ciao{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Seleziona un&apos;applicazione per iniziare</p>
        </div>

        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Squares className="w-7 h-7 text-gray-400" /></div>
            <p className="text-gray-700 font-medium">Nessuna applicazione disponibile</p>
            <p className="text-sm text-gray-400 mt-1">Contatta l&apos;amministratore per richiedere l&apos;accesso.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app: any) => (
              <a
                key={app.slug}
                href={app.url || '#'}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-200 block"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: app.color + '18' }}
                >
                  <span>{app.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{app.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{app.description}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-300 group-hover:text-slate-500 transition-colors">
                  <span>Apri</span>
                  <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
