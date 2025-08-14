'use client'

export default function DownloadHelp() {
  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg max-w-sm text-sm">
      <h3 className="font-bold mb-2">📱 Problemas com download no mobile?</h3>
      <ul className="space-y-1 text-xs">
        <li>• Chrome: Toque no ícone de escudo → Permitir pop-ups</li>
        <li>• Safari: Configurações → Safari → Desativar "Bloquear Pop-ups"</li>
        <li>• Firefox: Toque no ícone de escudo → Permitir</li>
      </ul>
    </div>
  )
}
