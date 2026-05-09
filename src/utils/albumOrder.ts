export type AlbumOrderInfo = {
  count: number
  folders: string[]
  usedOrders: number[]
  nextOrder: number
}

export function getAlbumOrderInfo(folderNames: string[]): AlbumOrderInfo {
  const usedOrders = folderNames
    .map((folderName) => {
      const match = folderName.match(/^(\d+)\./)
      return match ? Number(match[1]) : null
    })
    .filter((order): order is number => order !== null && Number.isInteger(order) && order > 0)
    .sort((a, b) => a - b)

  const nextOrder = usedOrders.length > 0 ? Math.max(...usedOrders) + 1 : 1

  return {
    count: folderNames.length,
    folders: folderNames,
    usedOrders,
    nextOrder,
  }
}
