// Utilitário de upload para o Google Drive via HTTP direto (sem 'googleapis')

type UploadArgs = {
  accessToken: string
  albumName: string
  fileName: string
  fileBuffer: any
  mimeType: string
  parentIdOverride?: string
}

type DriveFolder = {
  id: string
  name: string
}

type DriveItem = {
  id: string
  name: string
  mimeType?: string
}

const DEFAULT_DRIVE_ROOT_FOLDER_NAME = process.env.GDRIVE_ROOT_FOLDER_NAME || 'Issacar Imagens'

async function getDriveErrorMessage(response: Response, fallback: string) {
  const details = await response.text().catch(() => '')
  if (!details) return `${fallback} (${response.status})`

  try {
    const parsed = JSON.parse(details) as { error?: { message?: string } }
    return `${fallback} (${response.status}): ${parsed.error?.message || details}`
  } catch {
    return `${fallback} (${response.status}): ${details}`
  }
}

function driveFilesUrl(params: Record<string, string>) {
  return 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
    ...params,
  })
}

export async function resolveDriveRootFolderId({
  accessToken,
  parentIdOverride,
  createIfMissing = false,
}: {
  accessToken: string
  parentIdOverride?: string
  createIfMissing?: boolean
}) {
  if (parentIdOverride) return parentIdOverride
  if (process.env.GDRIVE_ROOT_FOLDER) return process.env.GDRIVE_ROOT_FOLDER

  const rootFolder = await findDriveFolder({ accessToken, folderName: DEFAULT_DRIVE_ROOT_FOLDER_NAME })
  if (rootFolder?.id) return rootFolder.id
  if (!createIfMissing) return null

  return ensureDriveFolder({ accessToken, folderName: DEFAULT_DRIVE_ROOT_FOLDER_NAME })
}

export async function uploadToGoogleDrive(args: UploadArgs): Promise<any> {
  const { accessToken, albumName, fileName, fileBuffer, mimeType, parentIdOverride } = args
  if (!accessToken) {
    return { success: false, message: 'Usuário não autenticado no Google' }
  }

  try {
    const driveRootFolder = await resolveDriveRootFolderId({
      accessToken,
      parentIdOverride,
      createIfMissing: true,
    })
    if (!driveRootFolder) {
      return { success: false, message: 'Falha ao localizar pasta raiz no Drive' }
    }

    const albumFolderId = await ensureDrivePath({ accessToken, folderPath: albumName, parentId: driveRootFolder })
    if (!albumFolderId) {
      return { success: false, message: 'Falha ao garantir pasta no Drive' }
    }

    const existingFile = await findDriveFile({ accessToken, fileName, parentId: albumFolderId })
    if (existingFile) {
      return { success: true, file: existingFile, skipped: true }
    }

    const upload = await driveMultipartUpload({
      accessToken,
      name: fileName,
      mimeType,
      parents: [albumFolderId],
      fileBuffer,
    })

    return { success: true, file: upload }
  } catch (err) {
    return { success: false, message: (err as Error).message }
  }
}

async function ensureDrivePath({
  accessToken,
  folderPath,
  parentId,
}: {
  accessToken: string
  folderPath: string
  parentId?: string
}) {
  const folderNames = folderPath.split('/').map((part) => part.trim()).filter(Boolean)
  let currentParentId = parentId

  for (const folderName of folderNames) {
    currentParentId = await ensureDriveFolder({ accessToken, folderName, parentId: currentParentId })
  }

  return currentParentId
}

async function ensureDriveFolder({ accessToken, folderName, parentId }: { accessToken: string; folderName: string; parentId?: string }) {
  const found = await findDriveFolder({ accessToken, folderName, parentId })
  if (found?.id) return found.id as string

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({ supportsAllDrives: 'true' }), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    }),
  })

  

  if (!createRes.ok) throw new Error(await getDriveErrorMessage(createRes, 'Falha ao criar pasta no Drive'))
  const createJson = await createRes.json()
  return createJson.id as string
}

export async function listDriveFolderNamesAtPath({
  accessToken,
  parentId,
  folderPath,
}: {
  accessToken: string
  parentId?: string
  folderPath: string
}) {
  const folderNames = folderPath.split('/').map((part) => part.trim()).filter(Boolean)
  let currentParentId = parentId

  for (const folderName of folderNames) {
    const folder = await findDriveFolder({ accessToken, folderName, parentId: currentParentId })
    if (!folder?.id) return []
    currentParentId = folder.id
  }

  if (!currentParentId) return []
  const folders = await listDriveChildFolders({ accessToken, parentId: currentParentId })
  return folders.map((folder) => folder.name)
}

export async function listDriveItemNamesAtPath({
  accessToken,
  parentId,
  folderPath,
}: {
  accessToken: string
  parentId?: string
  folderPath: string
}) {
  const parentFolderId = await findDriveFolderIdByPath({ accessToken, parentId, folderPath })
  if (!parentFolderId) return []

  const items = await listDriveChildItems({ accessToken, parentId: parentFolderId })
  return items.map((item) => item.name)
}

async function findDriveFolderIdByPath({
  accessToken,
  parentId,
  folderPath,
}: {
  accessToken: string
  parentId?: string
  folderPath: string
}) {
  const folderNames = folderPath.split('/').map((part) => part.trim()).filter(Boolean)
  let currentParentId = parentId

  for (const folderName of folderNames) {
    const folder = await findDriveFolder({ accessToken, folderName, parentId: currentParentId })
    if (!folder?.id) return null
    currentParentId = folder.id
  }

  return currentParentId || null
}

async function findDriveFolder({
  accessToken,
  folderName,
  parentId,
}: {
  accessToken: string
  folderName: string
  parentId?: string
}): Promise<DriveFolder | null> {
  const nameEscaped = folderName.replace(/'/g, "\\'")
  const qParts = [
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
    `name = '${nameEscaped}'`,
  ]
  if (parentId) qParts.push(`'${parentId}' in parents`)
  const q = qParts.join(' and ')

  const searchRes = await fetch(driveFilesUrl({ q, fields: 'files(id,name)' }), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!searchRes.ok) throw new Error(await getDriveErrorMessage(searchRes, 'Falha ao buscar pasta no Drive'))
  const searchJson = await searchRes.json()
  return searchJson.files?.[0] || null
}

async function listDriveChildFolders({
  accessToken,
  parentId,
}: {
  accessToken: string
  parentId: string
}): Promise<DriveFolder[]> {
  const q = [
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
    `'${parentId}' in parents`,
  ].join(' and ')

  const searchRes = await fetch(driveFilesUrl({ q, fields: 'files(id,name)', pageSize: '1000', orderBy: 'name' }), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!searchRes.ok) throw new Error(await getDriveErrorMessage(searchRes, 'Falha ao listar pastas no Drive'))
  const searchJson = await searchRes.json()
  return Array.isArray(searchJson.files) ? searchJson.files : []
}

async function listDriveChildItems({
  accessToken,
  parentId,
}: {
  accessToken: string
  parentId: string
}): Promise<DriveItem[]> {
  const q = [
    'trashed = false',
    `'${parentId}' in parents`,
  ].join(' and ')

  const searchRes = await fetch(driveFilesUrl({ q, fields: 'files(id,name,mimeType)', pageSize: '1000', orderBy: 'name' }), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!searchRes.ok) throw new Error(await getDriveErrorMessage(searchRes, 'Falha ao listar itens no Drive'))
  const searchJson = await searchRes.json()
  return Array.isArray(searchJson.files) ? searchJson.files : []
}

async function findDriveFile({
  accessToken,
  fileName,
  parentId,
}: {
  accessToken: string
  fileName: string
  parentId: string
}) {
  const nameEscaped = fileName.replace(/'/g, "\\'")
  const q = [
    'trashed = false',
    `name = '${nameEscaped}'`,
    `'${parentId}' in parents`,
  ].join(' and ')

  const searchRes = await fetch(driveFilesUrl({ q, fields: 'files(id,name,parents)' }), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!searchRes.ok) throw new Error(await getDriveErrorMessage(searchRes, 'Falha ao verificar arquivo no Drive'))
  const searchJson = await searchRes.json()
  return searchJson.files?.[0] || null
}

async function driveMultipartUpload({
  accessToken,
  name,
  mimeType,
  parents,
  fileBuffer,
}: {
  accessToken: string
  name: string
  mimeType: string
  parents?: string[]
    fileBuffer: any
}) {
  const boundary = 'xxxxxxxxxx' + Math.random().toString(16).slice(2)
  const meta = { name, parents }
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`
  const metaPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n` + JSON.stringify(meta)
  const bodyStart = Buffer.from(delimiter + metaPart + '\r\n' + `--${boundary}\r\n` + `Content-Type: ${mimeType}\r\n\r\n`) as any
  const bodyEnd = Buffer.from(closeDelimiter) as any
  const multipartBody = (Buffer as any).concat([bodyStart, fileBuffer, bodyEnd]) as any

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?' + new URLSearchParams({
    uploadType: 'multipart',
    fields: 'id,name,parents',
    supportsAllDrives: 'true',
  }), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(multipartBody.length),
    },
    body: multipartBody as any,
  })
  if (!res.ok) throw new Error(await getDriveErrorMessage(res, 'Falha no upload do arquivo no Drive'))
  return await res.json()
}
