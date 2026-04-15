/** Registro del foco del buscador principal (Home); usado por Command Palette global. */
let focusMainSearchHandler = null

export function setMainSearchFocusHandler(fn) {
  focusMainSearchHandler = typeof fn === 'function' ? fn : null
}

export function requestMainSearchFocus() {
  focusMainSearchHandler?.()
}
