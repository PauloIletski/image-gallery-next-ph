"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  FaCheckCircle,
  FaCloudUploadAlt,
  FaExclamationCircle,
  FaFolderOpen,
  FaGoogle,
  FaImages,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa'

type DriveFolder = {
  id: string
  name: string
}

type UploadResult = {
  success?: boolean
  error?: string
  drive?: {
    success?: boolean
    message?: string
  }
}

type StatusType = 'idle' | 'success' | 'error' | 'warning'

type AlbumOrderInfo = {
  count: number
  driveWarning?: string
  folders: string[]
  nextOrder: number
}

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const normalizeFolderName = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\\/]/g, '-')
    .replace(/[^a-zA-Z0-9._ -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

const formatFolderPreview = (folders: string[]) => {
  const visibleFolders = folders.slice(0, 4).join(', ')
  const remaining = folders.length - 4

  return remaining > 0 ? `${visibleFolders} e mais ${remaining}` : visibleFolders
}

const currentDate = new Date()

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [year, setYear] = useState(String(currentDate.getFullYear()))
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1))
  const [order, setOrder] = useState('')
  const [albumName, setAlbumName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<{ type: StatusType; text: string }>({
    type: 'idle',
    text: '',
  })
  const [isConnected, setIsConnected] = useState(false)
  const [isCheckingGoogle, setIsCheckingGoogle] = useState(true)
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([])
  const [driveParentId, setDriveParentId] = useState('')
  const [hasConfiguredDriveRoot, setHasConfiguredDriveRoot] = useState(false)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)
  const [orderInfo, setOrderInfo] = useState<AlbumOrderInfo | null>(null)

  const albumPath = useMemo(() => {
    const normalizedYear = year.trim()
    const monthIndex = Number(month) - 1
    const monthName = MONTHS[monthIndex] || ''
    const normalizedOrder = order.trim().replace(/[^0-9]/g, '')
    const normalizedAlbumName = normalizeFolderName(albumName)

    if (!normalizedYear || !monthName || !normalizedOrder || !normalizedAlbumName) return ''

    return `${normalizedYear}/${month}.${monthName}/${normalizedOrder}.${normalizedAlbumName}`
  }, [albumName, month, order, year])

  const cloudinaryAlbumPath = useMemo(() => {
     const normalizedOrder = order.trim().replace(/[^0-9]/g, '')
    const normalizedAlbumName = normalizeFolderName(albumName)

     if (!normalizedOrder || !normalizedAlbumName) return ''


    
    return `${normalizedOrder}.${normalizedAlbumName}`
  }, [albumName, order])

  const needsDriveFolderSelection = isConnected && !hasConfiguredDriveRoot
  const selectedDriveFolderName = driveFolders.find((folder) => folder.id === driveParentId)?.name
  const canSubmit = Boolean(
    albumPath
      && files.length > 0
      && !isUploading
      && isConnected
      && (!needsDriveFolderSelection || driveParentId)
  )

  const checkGoogleConnection = async () => {
    setIsCheckingGoogle(true)
    try {
      const res = await fetch('/api/drive/folders', { cache: 'no-store' })
      if (res.status === 401) {
        setIsConnected(false)
        setDriveFolders([])
        setDriveParentId('')
        setHasConfiguredDriveRoot(false)
        return
      }

      if (!res.ok) {
        throw new Error('Não foi possível carregar as pastas do Google Drive')
      }

      const data = await res.json()
      const hasConfiguredRoot = Boolean(data.hasConfiguredRoot)
      const folders = Array.isArray(data.files) ? data.files : []
      setIsConnected(true)
      setHasConfiguredDriveRoot(hasConfiguredRoot)

      if (hasConfiguredRoot) {
        setDriveFolders([])
        setDriveParentId('')
        return
      }

      setDriveFolders(folders)
      setDriveParentId((current) => current || folders[0]?.id || '')
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Não foi possível carregar as pastas do Google Drive',
      })
    } finally {
      setIsCheckingGoogle(false)
    }
  }

  useEffect(() => {
    checkGoogleConnection()
  }, [])

  const loadNextOrder = useCallback(async () => {
    if (!year.trim() || !month) return
    if (needsDriveFolderSelection && !driveParentId) return

    setIsLoadingOrder(true)
    try {
      const params = new URLSearchParams({ year: year.trim(), month })
      if (needsDriveFolderSelection && driveParentId) {
        params.set('driveParentId', driveParentId)
      }
      const res = await fetch(`/api/galleries/next-order?${params.toString()}`, { cache: 'no-store' })

      if (!res.ok) {
        throw new Error('Não foi possível determinar a próxima ordem')
      }

      const data = (await res.json()) as AlbumOrderInfo
      setOrderInfo(data)
      setOrder(String(data.nextOrder))
      if (data.driveWarning) {
        setStatus({ type: 'warning', text: data.driveWarning })
      }
    } catch (error) {
      setOrderInfo(null)
      setStatus({
        type: 'warning',
        text: error instanceof Error ? error.message : 'Não foi possível determinar a próxima ordem',
      })
    } finally {
      setIsLoadingOrder(false)
    }
  }, [driveParentId, month, needsDriveFolderSelection, year])

  useEffect(() => {
    loadNextOrder()
  }, [loadNextOrder])

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google/start'
  }

  const logoutGoogle = async () => {
    await fetch('/api/auth/google/logout', { method: 'POST' })
    setIsConnected(false)
    setDriveFolders([])
    setDriveParentId('')
    setHasConfiguredDriveRoot(false)
  }

  const addFiles = (nextFiles: FileList | File[]) => {
    const incoming = Array.from(nextFiles).filter((file) => file.type.startsWith('image/'))
    setFiles((current) => {
      const existing = new Set(current.map((file) => `${file.name}-${file.size}-${file.lastModified}`))
      const merged = [...current]

      for (const file of incoming) {
        const key = `${file.name}-${file.size}-${file.lastModified}`
        if (!existing.has(key)) merged.push(file)
      }

      return merged
    })
  }

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!albumPath) {
      setStatus({ type: 'error', text: 'Informe ano, mês, ordem e nome do álbum.' })
      return
    }

    if (files.length === 0) {
      setStatus({ type: 'error', text: 'Selecione ao menos uma imagem.' })
      return
    }

    if (!isConnected) {
      setStatus({ type: 'error', text: 'Faça login no Google para enviar com backup no Drive.' })
      return
    }

    if (needsDriveFolderSelection && !driveParentId) {
      setStatus({ type: 'error', text: 'Selecione a pasta raiz existente do Google Drive.' })
      return
    }

    setIsUploading(true)
    setProgress(0)
    setStatus({ type: 'idle', text: '' })

    let uploaded = 0
    let driveFailures = 0

    try {
      for (const file of files) {
        const form = new FormData()
        form.append('slug', cloudinaryAlbumPath)
        form.append('file', file)
        if (!hasConfiguredDriveRoot && needsDriveFolderSelection) {
          form.append('driveParentId', driveParentId)
        }

        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const data = (await res.json().catch(() => ({}))) as UploadResult

        if (!res.ok || data.error) {
          throw new Error(data.error || `Falha ao enviar ${file.name}`)
        }

        if (data.drive?.success === false) {
          driveFailures += 1
        }

        uploaded += 1
        setProgress(Math.round((uploaded / files.length) * 100))
      }

      setFiles([])
      setStatus({
        type: driveFailures > 0 ? 'warning' : 'success',
        text: driveFailures > 0
          ? 'Upload concluído no Cloudinary, mas alguns backups no Drive falharam.'
          : 'Upload concluído com sucesso.',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Falha ao enviar as imagens.',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-neutral-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <section className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/45">Issacar Imagens</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Upload de imagens</h1>
            </div>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Voltar
            </Link>
          </div>

          <form onSubmit={onSubmit} className="grid gap-6">
            <div className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                  <FaFolderOpen className="h-4 w-4 text-white/75" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Identificação do álbum</h2>
                  <p className="text-xs text-white/45">A estrutura será criada no Cloudinary e no Google Drive.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px]">
                <div className="grid gap-2">
                  <label htmlFor="album-year" className="text-sm font-medium text-white/85">
                    Ano
                  </label>
                  <input
                    id="album-year"
                    type="number"
                    min="2000"
                    max="2100"
                    className="h-11 rounded-md border border-white/15 bg-white px-3 text-base text-black outline-none transition placeholder:text-black/40 focus:border-white focus:ring-2 focus:ring-white/20"
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="album-month" className="text-sm font-medium text-white/85">
                    Mês
                  </label>
                  <select
                    id="album-month"
                    value={month}
                    onChange={(event) => setMonth(event.target.value)}
                    disabled={isUploading}
                    className="h-11 rounded-md border border-white/15 bg-white px-3 text-base text-black outline-none transition focus:border-white focus:ring-2 focus:ring-white/20"
                  >
                    {MONTHS.map((monthName, index) => (
                      <option key={monthName} value={String(index + 1)}>
                        {index + 1}.{monthName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="album-order" className="text-sm font-medium text-white/85">
                    Ordem
                  </label>
                  <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2">
                    <input
                      id="album-order"
                      type="number"
                      min="1"
                      placeholder="1"
                      className="h-11 min-w-0 flex-1 rounded-md border border-white/15 bg-white px-3 text-base text-black outline-none transition placeholder:text-black/40 focus:border-white focus:ring-2 focus:ring-white/20"
                      value={order}
                      onChange={(event) => setOrder(event.target.value)}
                      disabled={isUploading || isLoadingOrder}
                    />
                    <button
                      type="button"
                      onClick={loadNextOrder}
                      disabled={isUploading || isLoadingOrder}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      title="Recalcular ordem"
                    >
                      {isLoadingOrder ? <FaSpinner className="h-4 w-4 animate-spin" /> : '#'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="album-name" className="text-sm font-medium text-white/85">
                  Nome do álbum
                </label>
                <input
                  id="album-name"
                  type="text"
                  placeholder="ex: culto domingo"
                  className="h-11 rounded-md border border-white/15 bg-white px-3 text-base text-black outline-none transition placeholder:text-black/40 focus:border-white focus:ring-2 focus:ring-white/20"
                  value={albumName}
                  onChange={(event) => setAlbumName(event.target.value)}
                  disabled={isUploading}
                />
              </div>

              <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-widest text-white/40">Pasta final</p>
                <p className="mt-1 break-all font-mono text-sm text-white/80">
                  {cloudinaryAlbumPath || 'ano/numero.Mês/ordem.nome-do-album'}
                </p>
                {orderInfo && (
                  <p className="mt-2 text-xs text-white/45">
                    {orderInfo.count === 0
                      ? 'Nenhuma pasta encontrada neste mês. Ordem sugerida: 1.'
                      : `${orderInfo.count} pasta(s) encontrada(s): ${formatFolderPreview(orderInfo.folders)}. Próxima ordem: ${orderInfo.nextOrder}.`}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
                  <FaImages className="h-4 w-4 text-white/75" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Arquivos</h2>
                  <p className="text-xs text-white/45">{files.length} arquivo(s) selecionado(s)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                  addFiles(event.dataTransfer.files)
                }}
                disabled={isUploading}
                className={`flex min-h-52 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition ${
                  isDragging
                    ? 'border-white bg-white/15'
                    : 'border-white/20 bg-black/30 hover:border-white/40 hover:bg-white/10'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <FaCloudUploadAlt className="mb-4 h-9 w-9 text-white/70" />
                <span className="text-sm font-medium text-white">Arraste imagens aqui ou clique para selecionar</span>
                <span className="mt-2 text-xs text-white/50">JPG, PNG, WEBP e outros formatos de imagem</span>
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files)
                  event.target.value = ''
                }}
              />
            </div>

            {files.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <span className="text-sm font-medium">{files.length} arquivo(s) selecionado(s)</span>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    disabled={isUploading}
                    className="text-xs font-medium text-white/60 underline-offset-4 transition hover:text-white hover:underline disabled:opacity-50"
                  >
                    Limpar
                  </button>
                </div>
                <ul className="max-h-64 divide-y divide-white/10 overflow-auto">
                  {files.map((file, index) => (
                    <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex min-w-0 items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white/90">{file.name}</p>
                        <p className="text-xs text-white/45">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                        aria-label={`Remover ${file.name}`}
                      >
                        <FaTimes className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isUploading && (
              <div className="grid gap-2">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-white/50">{progress}% enviado</p>
              </div>
            )}

            {status.text && (
              <div
                className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${
                  status.type === 'success'
                    ? 'border-green-400/30 bg-green-400/10 text-green-100'
                    : status.type === 'warning'
                      ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-100'
                      : 'border-red-400/30 bg-red-400/10 text-red-100'
                }`}
              >
                {status.type === 'success' ? (
                  <FaCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <FaExclamationCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  Enviando
                </>
              ) : (
                'Enviar imagens'
              )}
            </button>
          </form>
        </section>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
              <FaFolderOpen className="h-5 w-5 text-white/75" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Google Drive</h2>
              <p className="break-words text-xs text-white/45">
                {isCheckingGoogle ? 'Verificando conexão...' : isConnected ? 'Conta conectada' : 'Conta não conectada'}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {!isConnected ? (
              <button
                type="button"
                onClick={loginWithGoogle}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                <FaGoogle className="h-4 w-4" />
                Entrar com Google
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={checkGoogleConnection}
                  disabled={isCheckingGoogle}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-50"
                >
                  Verificar conexão
                </button>
                <button
                  type="button"
                  onClick={logoutGoogle}
                  className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-white/55 transition hover:bg-white/10 hover:text-white"
                >
                  Desconectar
                </button>
              </>
            )}
          </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div>
              <p className="text-sm font-medium text-white">Backup obrigatório</p>
              <p className="mt-1 text-xs text-white/50">
                O envio só continua depois que o arquivo é salvo no Google Drive.
              </p>
            </div>

            {needsDriveFolderSelection && (
              <div className="mt-4 grid gap-2">
                <label htmlFor="drive-folder" className="text-sm font-medium text-white/80">
                  Pasta raiz existente no Drive
                </label>
                <select
                  id="drive-folder"
                  value={driveParentId}
                  onChange={(event) => setDriveParentId(event.target.value)}
                  disabled={isCheckingGoogle || isUploading || driveFolders.length === 0}
                  className="h-11 min-w-0 rounded-md border border-white/15 bg-white px-3 text-sm text-black outline-none transition focus:border-white focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Selecione uma pasta</option>
                  {driveFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-white/45">
                  Como não há uma raiz fixa configurada no servidor, esta pasta define onde o caminho abaixo será criado.
                </p>
              </div>
            )}

            <dl className="mt-4 grid gap-3 text-sm">
              <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
                <dt className="text-xs font-medium uppercase tracking-widest text-white/40">Raiz do Drive</dt>
                <dd className="mt-1 break-words text-white/80">
                  {hasConfiguredDriveRoot ? 'albums' : selectedDriveFolderName || 'Aguardando seleção'}
                </dd>
              </div>
              <div className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
                <dt className="text-xs font-medium uppercase tracking-widest text-white/40">Destino</dt>
                <dd className="mt-1 break-all font-mono text-sm text-white/80">
                  {albumPath || 'ano/numero.Mes/ordem.nome-do-album'}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  )
}
