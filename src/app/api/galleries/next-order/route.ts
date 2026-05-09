import { NextRequest, NextResponse } from 'next/server'
import { getAlbumOrderInfo } from '@/utils/albumOrder'
import { cloudinaryService } from '@/utils/cloudinaryService'
import { applyGoogleTokenCookies, getGoogleAccessToken } from '@/utils/googleAuth'
import { listDriveItemNamesAtPath, resolveDriveRootFolderId } from '@/utils/googleDrive'

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

function getCloudinaryHttpCode(error: unknown) {
  const cloudinaryError = error as { http_code?: number; error?: { http_code?: number } }
  return cloudinaryError.http_code || cloudinaryError.error?.http_code
}

async function getCloudinaryFolderNames(folderPath: string) {
  try {
    const { folders } = await cloudinaryService.getGalleryFolders(folderPath)
    return Array.isArray(folders) ? folders.map((folder) => folder.name) : []
  } catch (error) {
    if (getCloudinaryHttpCode(error) === 404) {
      return []
    }

    throw error
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const year = String(url.searchParams.get('year') || '').trim()
  const month = Number(url.searchParams.get('month'))
  const driveParentId = String(url.searchParams.get('driveParentId') || '').trim()
  const monthName = MONTHS[month - 1]

  if (!year || !monthName) {
    return NextResponse.json({ error: 'Ano e mês são obrigatórios' }, { status: 400 })
  }

  const folderPath = `galeries/${year}/${month}.${monthName}`
  const relativeFolderPath = `${year}/${month}.${monthName}`

  try {
    const folderNames = new Set<string>()
    const cloudinaryFolderNames = await getCloudinaryFolderNames(folderPath)
    cloudinaryFolderNames.forEach((folderName) => folderNames.add(folderName))

    let driveWarning: string | undefined
    const tokenResult = await getGoogleAccessToken(req)
    const accessToken = tokenResult.accessToken
    if (accessToken) {
      try {
        const driveRootFolder = await resolveDriveRootFolderId({
          accessToken,
          parentIdOverride: driveParentId || undefined,
        })

        if (driveRootFolder) {
          const driveItemNames = await listDriveItemNamesAtPath({
            accessToken,
            parentId: driveRootFolder,
            folderPath: relativeFolderPath,
          })
          driveItemNames.forEach((itemName) => folderNames.add(itemName))
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        driveWarning = `Não foi possível consultar itens legados no Google Drive: ${message}`
        console.warn(
          'Aviso ao consultar Drive para próxima ordem:',
          message
        )
      }
    }

    return applyGoogleTokenCookies(NextResponse.json({
      folderPath,
      driveFolderPath: relativeFolderPath,
      driveWarning,
      ...getAlbumOrderInfo(Array.from(folderNames)),
    }), tokenResult)
  } catch (error) {
    console.error('Erro ao determinar próxima ordem:', error instanceof Error ? error.message : 'Erro desconhecido')
    return NextResponse.json({ error: 'Falha ao verificar pastas existentes' }, { status: 500 })
  }
}
