'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { XMark, Plus, Trash } from '@/components/icons'

export type AdminOptions = { company: string[]; team: string[]; job_title: string[] }

const CATEGORIES: { key: keyof AdminOptions; label: string; placeholder: string }[] = [
  { key: 'company',   label: 'Aziende',             placeholder: 'Nuova azienda' },
  { key: 'team',      label: 'Team',                placeholder: 'Nuovo team' },
  { key: 'job_title', label: 'Ruoli professionali', placeholder: 'Nuovo ruolo professionale' },
]

export default function AdminSettings({ options, onClose }: { options: AdminOptions; onClose: () => void }) {
  const supabase = createClient()
  const router = useRouter()
  const [newValues, setNewValues] = useState<Record<string, string>>({ company: '', team: '', job_title: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function addOption(category: keyof AdminOptions) {
    const value = newValues[category].trim()
    if (!value) return
    setBusy(true); setError('')
    const { error } = await supabase.from('admin_options').insert({ category, value })
    setBusy(false)
    if (error) {
      setError(error.code === '23505' ? `"${value}" è già presente` : error.message)
      return
    }
    setNewValues(v => ({ ...v, [category]: '' }))
    router.refresh()
  }

  async function removeOption(category: keyof AdminOptions, value: string) {
    setBusy(true); setError('')
    const { error } = await supabase.from('admin_options').delete().eq('category', category).eq('value', value)
    setBusy(false)
    if (error) { setError(error.message); return }
    router.refresh()
  }

  const inputCls = 'flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-colors bg-white'

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] max-h-[90dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900">Impostazioni</h3>
            <p className="text-xs text-gray-400 mt-0.5">Gestisci gli elenchi usati nei form (azienda, team, ruoli)</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <XMark className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}

          {CATEGORIES.map(({ key, label, placeholder }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {options[key].length === 0 && (
                  <span className="text-xs text-gray-400">Nessun valore</span>
                )}
                {options[key].map(value => (
                  <span key={value} className="inline-flex items-center gap-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-1.5 py-1 text-gray-700">
                    {value}
                    <button
                      onClick={() => removeOption(key, value)}
                      disabled={busy}
                      title="Rimuovi"
                      className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newValues[key]}
                  onChange={e => setNewValues(v => ({ ...v, [key]: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(key) } }}
                  className={inputCls}
                  placeholder={placeholder}
                />
                <button
                  onClick={() => addOption(key)}
                  disabled={busy || !newValues[key].trim()}
                  className="inline-flex items-center gap-1.5 bg-slate-900 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi
                </button>
              </div>
            </div>
          ))}

          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            Rimuovere un valore non modifica i collaboratori che lo hanno già assegnato: il valore resta sul loro profilo, ma non comparirà più tra le opzioni selezionabili.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}
