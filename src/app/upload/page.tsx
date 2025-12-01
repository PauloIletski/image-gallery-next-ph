"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { FaGoogle, FaFolderOpen } from 'react-icons/fa'

type GalleryOption = { value: string; label: string }

export default function UploadPage() {
  const [slug, setSlug] = useState<string>("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [message, setMessage] = useState<string>("")
  const [galleries, setGalleries] = useState<GalleryOption[]>([])
  const [googleToken, setGoogleToken] = useState<string>("")
  const [backup, setBackup] = useState<boolean>(true)
  const [driveParentId, setDriveParentId] = useState<string>("")
  const [driveParentName, setDriveParentName] = useState<string>("")
  const [driveFolders, setDriveFolders] = useState<Array<{ id: string; name: string }>>([])
  const [isDragging, setIsDragging] = useState(false)

  // Login Google via OAuth backend (cookies httpOnly)
  const loginWithGoogle = async () => {
    window.location.href = '/api/auth/google/start'
  }

  // Picker do Google para selecionar pasta
  const openGoogleFolderPicker = async () => {
    // Carrega scripts
    // @ts-ignore
    const gapi = (window as any).gapi
    // @ts-ignore
    const google = (window as any).google
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    if (!clientId || !apiKey) {
      setMessage('Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID e NEXT_PUBLIC_GOOGLE_API_KEY')
      return
    }

    // Obter token de acesso apenas para o Picker (cliente)
    const token = await new Promise<string>((resolve, reject) => {
      if (!google?.accounts?.oauth2) return reject(new Error('SDK do Google não carregado'))
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
        callback: (resp: any) => {
          if (resp?.access_token) resolve(resp.access_token)
          else reject(new Error('Falha ao obter token'))
        },
      })
      client.requestAccessToken()
    })

    // Carregar picker
    await new Promise<void>((resolve) => {
      if (gapi?.load) {
        gapi.load('picker', { callback: () => resolve() })
      } else {
        resolve()
      }
    })

    // @ts-ignore
    const googleNS = (window as any).google
    if (!googleNS?.picker) {
      setMessage('Google Picker não disponível')
      return
    }

    // @ts-ignore
    const view = new googleNS.picker.DocsView(googleNS.picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes('application/vnd.google-apps.folder')
    // @ts-ignore
    const picker = new googleNS.picker.PickerBuilder()
      .enableFeature(googleNS.picker.Feature.SIMPLE_UPLOAD_DISABLED)
      .setAppId('')
      .setOAuthToken(token)
      .setDeveloperKey(apiKey)
      .addView(view)
      .setCallback((data: any) => {
        if (data?.action === 'picked' && data?.docs?.length) {
          const picked = data.docs[0]
          setDriveParentId(picked.id)
          setDriveParentName(picked.name || '')
        }
      })
      .build()
    picker.setVisible(true)
  }

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

  const onDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const dropped = e.dataTransfer?.files
    if (!dropped || dropped.length === 0) return
    const current = files ? Array.from(files) : []
    const combined = [...current, ...Array.from(dropped)]
    const dataTransfer = new DataTransfer()
    combined.forEach((f) => dataTransfer.items.add(f))
    setFiles(dataTransfer.files)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    if (!slug || !files || files.length === 0) {
      setMessage('Selecione uma galeria e ao menos um arquivo')
      return
    }
    if (!googleToken) {
      setMessage('Faça login no Google para realizar o upload com backup automático')
      return
    }
    if (!driveParentId) {
      setMessage('Selecione a pasta de destino no Google Drive')
      return
    }
    setIsUploading(true)
    setProgress(0)

    let uploaded = 0
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('slug', slug)
      form.append('file', file)
      form.append('backup', 'true')
      if (driveParentId) form.append('driveParentId', driveParentId)
      const headers: Record<string, string> = {}
      if (googleToken) headers['Authorization'] = `Bearer ${googleToken}`
      const res = await fetch('/api/upload', { method: 'POST', body: form, headers })
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
      {/* Scripts necessários para Picker (GIS + gapi) */}
      <Script src="https://accounts.google.com/gsi/client" async defer />
      <Script src="https://apis.google.com/js/api.js" async defer />
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

          {/* Campo de token removido: login agora ocorre automaticamente ao habilitar backup */}

          <div className="grid gap-3">
            <label className="text-sm font-medium">Arquivos</label>
            <div
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:bg-gray-50'}`}
              onClick={() => document.getElementById('file-input-hidden')?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
              onDrop={onDropFiles}
            >
              <input
                id="file-input-hidden"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
              <div className="text-sm text-gray-600">
                Arraste e solte suas imagens aqui ou
                <span className="mx-1 inline-flex items-center rounded-md bg-gray-900 px-2 py-1 text-white">clique para selecionar</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">Formatos suportados: JPG, PNG, WEBP • Vários arquivos</div>
            </div>
            {files && files.length > 0 && (
              <div className="rounded-lg border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Selecionados: {files.length}</span>
                  <button
                    type="button"
                    onClick={() => setFiles(null)}
                    className="text-xs text-gray-600 underline hover:text-gray-800"
                  >
                    Limpar
                  </button>
                </div>
                <ul className="max-h-40 divide-y divide-gray-100 overflow-auto">
                  {Array.from(files).map((f, idx) => (
                    <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="truncate text-gray-700">{f.name}</span>
                      <span className="ml-3 shrink-0 text-xs text-gray-500">{Math.round(f.size / 1024)} KB</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Login no Google é obrigatório para backup automático</div>
              {!googleToken ? (
                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-black/5 hover:bg-black"
                >
                  <FaGoogle className="h-4 w-4" /> Entrar com Google
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-100">Conectado ao Google</div>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Pasta de destino no Drive</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  disabled={!googleToken}
                  onClick={openGoogleFolderPicker}
                >
                  <FaFolderOpen className="h-4 w-4" /> Selecionar pasta no Google
                </button>
                {driveParentName && (
                  <span className="text-sm text-gray-700">Selecionada: <span className="font-medium">{driveParentName}</span></span>
                )}
              </div>
            </div>
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
              disabled={isUploading || (backup && !googleToken)}
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


