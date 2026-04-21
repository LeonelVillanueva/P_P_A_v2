const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || '/api/data'

export async function callSecureDataApi(action, payload = {}) {
  const response = await fetch(DATA_API_URL, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action, ...payload })
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message = [data?.error, data?.hint].filter(Boolean).join(': ')
    throw new Error(message || 'Error de servidor')
  }

  return data
}

