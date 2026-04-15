import { getAnimeObraKey, compareAnimesByTitle } from './animeTitles'

/**
 * Agrupa animes filtrados por obra (titulo_original) para una sola card por serie en cuadrícula.
 */
export function groupAnimesByObra(animes) {
  if (!animes?.length) return []

  const grouped = {}

  for (const anime of animes) {
    const key = getAnimeObraKey(anime) || '(sin título)'
    if (!grouped[key]) {
      grouped[key] = {
        titulo_original: key,
        imagen_url: anime.imagen_url || null,
        temporadas: [],
        estados: new Set(),
        jikan_id: anime.jikan_id || null
      }
    }
    grouped[key].temporadas.push(anime)
    if (anime.estado) grouped[key].estados.add(anime.estado)
    if (!grouped[key].imagen_url && anime.imagen_url) {
      grouped[key].imagen_url = anime.imagen_url
    }
  }

  return Object.values(grouped).map((serie) => {
    serie.estados = Array.from(serie.estados).sort((a, b) => a.localeCompare(b, 'es'))
    serie.temporadas.sort(compareAnimesByTitle)
    serie.total_temporadas = serie.temporadas.length
    return serie
  })
}
