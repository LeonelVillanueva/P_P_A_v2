import { ref, computed, unref } from 'vue'

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

/**
 * Mes visible, rejilla de 6 semanas y navegación para el calendario de estrenos.
 * @param {import('vue').Ref<unknown[]> | import('vue').ComputedRef<unknown[]>} animesRef Lista reactiva de animes (con `fecha_estreno`, `id`).
 */
export function useCalendarMonth(animesRef) {
  const currentDate = ref(new Date())
  const dropTargetDay = ref(null)

  const weekDays = WEEK_DAYS

  const currentYear = computed(() => currentDate.value.getFullYear())
  const currentMonth = computed(() => currentDate.value.getMonth())

  const currentMonthName = computed(() =>
    currentDate.value
      .toLocaleDateString('es-ES', { month: 'long' })
      .replace(/^\w/, (c) => c.toUpperCase())
  )

  const calendarDays = computed(() => {
    const year = currentYear.value
    const month = currentMonth.value
    const animes = unref(animesRef) || []

    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay()

    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    const prevMonth = new Date(year, month, 0)
    const daysInPrevMonth = prevMonth.getDate()

    const days = []

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        animes: [],
        animesCount: 0,
        isDropTarget: false
      })
    }

    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]

      const dayAnimes = animes.filter((anime) => {
        if (!anime.fecha_estreno) return false
        const animeDate = new Date(anime.fecha_estreno).toISOString().split('T')[0]
        return animeDate === dateStr
      })

      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        animes: dayAnimes,
        animesCount: dayAnimes.length,
        isDropTarget: dropTargetDay.value?.toDateString() === date.toDateString()
      })
    }

    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        animes: [],
        animesCount: 0,
        isDropTarget: false
      })
    }

    return days
  })

  function previousMonth() {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
  }

  function nextMonth() {
    currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
  }

  function goToToday() {
    currentDate.value = new Date()
  }

  return {
    weekDays,
    currentYear,
    currentMonth,
    currentMonthName,
    calendarDays,
    dropTargetDay,
    previousMonth,
    nextMonth,
    goToToday
  }
}
