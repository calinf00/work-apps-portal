'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XMark } from '@/components/icons'

export default function AdminCreateUser({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name:            '',
    email:                '',
    password:             '',
    company:              '',
    team:                 '',
    job_title:            '',
    hire_date:            '',
    end_date:             '',
    notes:                '',
    role:                 'user',
    is_active:            true,
    annual_riposi_days:   '18',
    annual_permessi_days: '5',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const body = {
      full_name:            form.full_name,
      email:                form.email,
      password:             form.password,
      company:              form.company,
      team:                 form.team,
      job_title:            form.job_title,
      hire_date:            form.hire_date,
      end_date:             form.end_date,
      notes:                form.notes,
      role:                 form.role,
      is_active:            form.is_active,
      annual_riposi_days:   parseInt(form.annual_riposi_days)   || 18,
      annual_permessi_days: parseInt(form.annual_permessi_days) || 5,
    }

    const res  = await fetch('/api/admin/create-user', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error ?? 'Errore durante la creazione')
    } else {
      router.refresh()
      onClose()
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-colors bg-white'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide'

  const JOB_TITLES = ['Tecnico', 'Sviluppatore', 'Designer', 'Responsabile di team', 'Direzione', 'Commerciale', 'Amministrazione', 'Consulente']
  const riposiWeekly   = ((parseInt(form.annual_riposi_days)   || 0) / 52).toFixed(2)
  const permessiWeekly = ((parseInt(form.annual_permessi_days) || 0) / 52).toFixed(2)

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900">Crea nuovo collaboratore</h3>
            <p className="text-xs text-gray-400 mt-0.5">Compila i dati del nuovo utente</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <XMark className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Dati personali */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Dati personali</p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className={labelCls}>Nome completo</label>
                <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} className={inputCls} placeholder="Mario Rossi" />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} placeholder="mario@azienda.it" />
              </div>
              <div>
                <label className={labelCls}>Password temporanea</label>
                <input type="password" required minLength={6} value={form.password} onChange={e => set('password', e.target.value)} className={inputCls} placeholder="••••••••" />
              </div>
            </div>
          </div>

          {/* Anagrafica lavorativa */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Anagrafica lavorativa</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Azienda</label>
                <input type="text" value={form.company} onChange={e => set('company', e.target.value)} className={inputCls} placeholder="Es. XYZ Srl" />
              </div>
              <div>
                <label className={labelCls}>Team</label>
                <input type="text" value={form.team} onChange={e => set('team', e.target.value)} className={inputCls} placeholder="Es. Sviluppo" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Ruolo professionale</label>
                <input
                  type="text"
                  list="job-titles-create"
                  value={form.job_title}
                  onChange={e => set('job_title', e.target.value)}
                  className={inputCls}
                  placeholder="Es. Tecnico, Responsabile di team..."
                />
                <datalist id="job-titles-create">
                  {JOB_TITLES.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>
              <div>
                <label className={labelCls}>Inizio collaborazione</label>
                <input type="date" value={form.hire_date} onChange={e => set('hire_date', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fine collaborazione</label>
                <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className={inputCls} min={form.hire_date || undefined} />
              </div>
              <div>
                <label className={labelCls}>Giorni di riposo / anno</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={form.annual_riposi_days}
                  onChange={e => set('annual_riposi_days', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Permessi (giorni) / anno</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={form.annual_permessi_days}
                  onChange={e => set('annual_permessi_days', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                  Maturazione settimanale: <span className="font-medium text-gray-600">{riposiWeekly} gg riposo</span> · <span className="font-medium text-gray-600">{permessiWeekly} gg permessi</span>
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Note</p>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="Informazioni aggiuntive sul collaboratore..."
            />
          </div>

          {/* Accesso */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Accesso</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Ruolo sistema</label>
                <select value={form.role} onChange={e => set('role', e.target.value)} className={inputCls}>
                  <option value="user">Collaboratore</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex flex-col justify-end pb-0.5">
                <label className={labelCls}>Stato account</label>
                <button
                  type="button"
                  onClick={() => set('is_active', !form.is_active)}
                  className={`flex items-center gap-2 text-sm font-medium px-3 py-2.5 rounded-xl border transition-colors ${form.is_active ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${form.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  {form.is_active ? 'Attivo' : 'Disattivato'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="flex gap-3 pt-1 pb-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              Annulla
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-slate-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
              {loading ? 'Creazione...' : 'Crea utente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
