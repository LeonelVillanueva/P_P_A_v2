/**
 * CSV mínimo: título original, título de entrega, temporadas, estado.
 * BOM UTF-8 para abrir bien en Excel.
 */

function escapeCsvCell(value) {
  if (value == null || value === '') return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function formatTemporadasCell(anime) {
  if (!Array.isArray(anime.temporadas) || anime.temporadas.length === 0) return ''
  return anime.temporadas.join('; ')
}

export function buildAnimeEssentialCsv(animes) {
  const lines = [['Titulo original', 'Titulo entrega', 'Temporadas', 'Estado'].map(escapeCsvCell).join(',')]
  for (const a of animes) {
    const original = a.titulo_original ?? ''
    const entrega = a.titulo_entrega ?? ''
    const temporadas = formatTemporadasCell(a)
    const estado = a.estado ?? ''
    lines.push([original, entrega, temporadas, estado].map(escapeCsvCell).join(','))
  }
  return `\uFEFF${lines.join('\r\n')}`
}

export function downloadAnimeEssentialCsv(filename, csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}
