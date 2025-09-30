"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

type GalleryOption = { value: string; label: string }

export default function UploadPage() {
  const [slug, setSlug] = useState<string>("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [message, setMessage] = useState<string>("")
  const [galleries, setGalleries] = useState<GalleryOption[]>([])

  useEffect(() => {
    const loadSlugs = async () => {
      try {
        const res = await fetch('/data/gallerySlugs.json', { cache: 'no-store' })
        if (!res.ok) return
        const data: string[] = await res.json()
        setGalleries(data.map((s) => ({ value: s, label: s.replace(/_/g, ' ') })))
      } catch {}
    }
    loadSlugs()
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    if (!slug || !files || files.length === 0) {
      setMessage('Selecione uma galeria e ao menos um arquivo')
      return
    }
    setIsUploading(true)
    setProgress(0)

    let uploaded = 0
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('slug', slug)
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) {
        setMessage('Falha ao enviar um ou mais arquivos')
        setIsUploading(false)
        return
      }
      uploaded += 1
      setProgress(Math.round((uploaded / files.length) * 100))
    }

    setIsUploading(false)
    setMessage('Upload concluído com sucesso')
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Upload de Imagens</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">Voltar</Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={onSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nome do Álbum (obrigatório)</label>
            <input
              type="text"
              placeholder="ex: culto_domingo_2025_09_28"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-400 focus:outline-none"
              value={slug}
              onChange={(e) => setSlug(e.target.value.trim())}
              required
            />
            {galleries.length > 0 && (
              <p className="text-xs text-gray-500">Sugestões existentes: {galleries.slice(0, 6).map(g => g.label).join(', ')}{galleries.length > 6 ? '…' : ''}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Arquivos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
              onChange={onFileChange}
            />
          </div>

      {isUploading && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-gray-800 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {message && (
            <div className="text-sm text-gray-700">{message}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
            >
              {isUploading ? 'Enviando...' : 'Enviar imagens'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}


