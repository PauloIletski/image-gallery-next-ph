// Utilitário de upload para o Google Drive via HTTP direto (sem 'googleapis')

type UploadArgs = {
  accessToken: string
  albumName: string
  fileName: string
  fileBuffer: Buffer
  mimeType: string
}

export async function uploadToGoogleDrive(args: UploadArgs): Promise<any> {
  const { accessToken, albumName, fileName, fileBuffer, mimeType } = args
  if (!accessToken) {
    return { success: false, message: 'Usuário não autenticado no Google' }
  }

  const driveRootFolder = process.env.GDRIVE_ROOT_FOLDER || ''

  try {
    const albumFolderId = await ensureDriveFolder({ accessToken, folderName: albumName, parentId: driveRootFolder })
    if (!albumFolderId) {
      return { success: false, message: 'Falha ao garantir pasta no Drive' }
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

async function ensureDriveFolder({ accessToken, folderName, parentId }: { accessToken: string; folderName: string; parentId?: string }) {
  const nameEscaped = folderName.replace(/'/g, "\'")
  const qParts = [
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
    `name = '${nameEscaped}'`,
  ]
  if (parentId) qParts.push(`'${parentId}' in parents`)
  const q = qParts.join(' and ')

  const searchRes = await fetch('https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({ q, fields: 'files(id,name)' }), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!searchRes.ok) throw new Error('Falha ao buscar pasta no Drive')
  const searchJson = await searchRes.json()
  const found = searchJson.files?.[0]
  if (found?.id) return found.id as string

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
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
  if (!createRes.ok) throw new Error('Falha ao criar pasta no Drive')
  const createJson = await createRes.json()
  return createJson.id as string
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
  fileBuffer: Buffer
}) {
  const boundary = 'xxxxxxxxxx' + Math.random().toString(16).slice(2)
  const meta = { name, parents }
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`
  const metaPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n` + JSON.stringify(meta)
  const bodyStart = Buffer.from(delimiter + metaPart + '\r\n' + `--${boundary}\r\n` + `Content-Type: ${mimeType}\r\n\r\n`)
  const bodyEnd = Buffer.from(closeDelimiter)
  const multipartBody = Buffer.concat([bodyStart, fileBuffer, bodyEnd])

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,parents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
      'Content-Length': String(multipartBody.length),
    },
    body: multipartBody,
  })
  if (!res.ok) throw new Error('Falha no upload do arquivo no Drive')
  return await res.json()
}


