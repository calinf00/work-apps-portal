import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  const {
    email, password, full_name,
    company, team, job_title, hire_date, end_date, notes,
    role, is_active, annual_riposi_days, annual_permessi_days,
  } = await request.json()

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name },
    email_confirm: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Il trigger handle_new_user ha creato la riga profiles (id, email, full_name).
  // Completiamo gli altri campi forniti dall'admin.
  const profileUpdates: Record<string, unknown> = {}
  if (full_name            !== undefined) profileUpdates.full_name            = full_name || null
  if (company              !== undefined) profileUpdates.company              = company   || null
  if (team                 !== undefined) profileUpdates.team                 = team      || null
  if (job_title            !== undefined) profileUpdates.job_title            = job_title || null
  if (hire_date            !== undefined) profileUpdates.hire_date            = hire_date || null
  if (end_date             !== undefined) profileUpdates.end_date             = end_date  || null
  if (notes                !== undefined) profileUpdates.notes                = notes     || null
  if (role                 !== undefined) profileUpdates.role                 = role
  if (is_active            !== undefined) profileUpdates.is_active            = is_active
  if (annual_riposi_days   !== undefined) profileUpdates.annual_riposi_days   = annual_riposi_days
  if (annual_permessi_days !== undefined) profileUpdates.annual_permessi_days = annual_permessi_days

  if (Object.keys(profileUpdates).length > 0) {
    const { error: profileError } = await adminClient.from('profiles').update(profileUpdates).eq('id', data.user.id)
    if (profileError) {
      console.error('[create-user] profile update fallito:', profileError.message, profileUpdates)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }
  }

  return NextResponse.json({ user: data.user })
}
