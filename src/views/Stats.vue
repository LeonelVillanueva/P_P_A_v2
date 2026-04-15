<template>
  <div class="min-h-screen bg-surface pb-[5.75rem] sm:pb-0">
    <AppChrome
      @open-config="shell.configModal.open()"
      @open-modal="shell.newAnimeOpener?.()"
      @open-calendar="shell.openCalendar()"
      @open-stats="shell.openStats()"
      @manual-ping="shell.handleManualPing"
      @open-help="shell.showHelp = true"
    />

    <main class="mx-auto w-full max-w-[min(100%,2200px)] px-2 py-2 text-ink sm:px-3 sm:py-3 md:px-4 md:py-4 lg:px-5 xl:px-6">
      <!-- Hero + filtros + acciones -->
      <section
        class="stats-enter relative overflow-hidden rounded-2xl border border-border-subtle bg-elevated p-3 shadow-card-lg ring-1 ring-black/[0.04] sm:p-4"
        style="animation-delay: 0ms"
      >
        <div
          class="pointer-events-none absolute inset-x-0 -top-6 h-24 bg-[radial-gradient(70%_65%_at_50%_0%,rgba(147,51,234,0.14),transparent_72%)]"
          aria-hidden="true"
        />
        <div class="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0 flex-1">
            <p class="text-xs uppercase tracking-[0.2em] text-accent/90">Panel analitico</p>
            <h1 class="font-display text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Inteligencia del catalogo</h1>
            <p class="mt-0.5 text-xs text-ink-muted sm:text-sm">
              Vista accionable para detectar equilibrio de estados, cadencia de estrenos y calidad del dataset.
            </p>

            <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div class="flex min-w-0 flex-col gap-1">
                <label for="stats-scope" class="text-[11px] font-medium text-ink-muted">Alcance</label>
                <select
                  id="stats-scope"
                  v-model="rangeScope"
                  class="w-full min-w-[12rem] rounded-xl border border-border-subtle bg-surface-muted/80 py-2.5 pl-3 pr-9 text-sm font-medium text-ink shadow-inner focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 sm:w-auto"
                >
                  <option value="full">Catálogo completo</option>
                  <option value="added">Fichas añadidas en el período</option>
                  <option value="premiere">Estrenos en el período</option>
                </select>
              </div>
              <div v-if="rangeScope !== 'full'" class="flex min-w-0 flex-col gap-1">
                <label for="stats-period" class="text-[11px] font-medium text-ink-muted">Período</label>
                <select
                  id="stats-period"
                  v-model="rangePreset"
                  class="w-full min-w-[12rem] rounded-xl border border-border-subtle bg-surface-muted/80 py-2.5 pl-3 pr-9 text-sm font-medium text-ink shadow-inner focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 sm:w-auto"
                >
                  <option value="30d">Últimos 30 días</option>
                  <option value="90d">Últimos 90 días</option>
                  <option value="365d">Últimos 365 días</option>
                  <option value="this_year">Año en curso</option>
                </select>
              </div>
            </div>
            <p v-if="rangeScope !== 'full'" class="mt-2 text-[11px] leading-snug text-ink-muted">
              {{ rangeDescription }}
            </p>
          </div>

          <div class="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[220px]">
            <p class="text-[11px] font-medium uppercase tracking-wide text-ink-muted">Acciones</p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="stats-action-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-muted/80 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-surface-muted sm:flex-initial"
                @click="router.push({ name: 'home' })"
              >
                <svg class="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Inicio
              </button>
              <button
                type="button"
                class="stats-action-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover px-3 py-2 text-xs font-semibold text-accent-foreground shadow-card transition hover:brightness-110 sm:flex-initial"
                @click="shell.newAnimeOpener?.()"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo anime
              </button>
              <button
                type="button"
                class="stats-action-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-muted/80 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-surface-muted sm:flex-initial"
                @click="shell.openCalendar()"
              >
                <svg class="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendario
              </button>
              <button
                type="button"
                class="stats-action-btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-muted/80 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-surface-muted sm:flex-initial"
                @click="shell.configModal.open()"
              >
                <svg class="h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ajustes
              </button>
            </div>
            <div class="text-right text-xs text-ink-muted sm:text-left">
              <span class="font-medium text-ink">{{ totalAnimes }}</span>
              animes en este corte
            </div>
          </div>
        </div>
      </section>

      <div
        v-if="rangeScope !== 'full' && filteredAnimes.length === 0"
        class="stats-enter mt-3 rounded-xl border border-dashed border-border-subtle bg-surface-muted/50 px-4 py-6 text-center text-sm text-ink-muted"
        style="animation-delay: 60ms"
      >
        No hay fichas que coincidan con este alcance y período. Prueba otro rango o vuelve a
        <button type="button" class="font-semibold text-accent underline-offset-2 hover:underline" @click="rangeScope = 'full'">
          catálogo completo
        </button>
        .
      </div>

      <Transition name="stats-panel" mode="out-in">
        <div
          v-if="rangeScope === 'full' || filteredAnimes.length > 0"
          :key="statsPanelKey"
          class="contents"
        >
      <section class="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <article
          v-for="(card, i) in summaryCards"
          :key="card.label"
          class="stats-card stats-kpi stats-enter relative overflow-hidden rounded-2xl border border-border-subtle p-3 shadow-card"
          :class="card.className"
          :style="{ animationDelay: `${80 + i * 45}ms` }"
        >
          <div
            class="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-[0.35] blur-2xl"
            :class="card.glowClass"
            aria-hidden="true"
          />
          <div class="relative">
            <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted/90">{{ card.label }}</p>
            <p
              class="stats-kpi-value mt-2 text-2xl font-black tabular-nums leading-none tracking-tight sm:text-3xl"
              :class="card.valueClass"
            >
              {{ card.value }}
            </p>
            <p class="mt-2 border-t border-black/[0.06] pt-2 text-[11px] leading-snug text-ink-muted">{{ card.hint }}</p>
          </div>
        </article>
      </section>

      <section class="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <article
          class="stats-enter stats-viz-panel relative overflow-hidden rounded-2xl border border-border-subtle bg-elevated p-3 sm:p-4 shadow-card xl:col-span-6"
          style="animation-delay: 260ms"
        >
          <div
            class="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(124,58,237,0.08),transparent_55%)]"
            aria-hidden="true"
          />
          <div class="relative mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 class="font-display text-lg font-semibold">Composición por estado</h2>
              <p class="text-xs text-ink-muted">Distribución del corte: donut + leyenda con barras.</p>
            </div>
            <span class="rounded-full border border-border-subtle bg-surface-muted/80 px-2.5 py-1 text-[11px] font-semibold text-ink-muted">
              {{ totalAnimes }} fichas
            </span>
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-[min(200px,100%)_1fr] sm:items-center">
            <div class="mx-auto flex max-w-[220px] flex-col items-center gap-3">
              <div class="stats-viz-donut-wrap relative flex h-[11.5rem] w-[11.5rem] items-center justify-center">
                <div
                  class="absolute inset-2 rounded-full opacity-[0.22] blur-2xl"
                  :style="{ background: estadoDonutGradient }"
                  aria-hidden="true"
                />
                <div
                  class="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/60 bg-elevated shadow-[0_8px_32px_-8px_rgb(15_23_42/0.18)] ring-1 ring-black/[0.04]"
                >
                  <div
                    class="stats-donut stats-viz-donut-ring relative h-[9.25rem] w-[9.25rem] rounded-full shadow-[inset_0_2px_12px_rgb(0_0_0/0.06)]"
                    :style="{ background: estadoDonutGradient }"
                    role="img"
                    aria-label="Gráfico circular de estados"
                  >
                    <div class="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-elevated shadow-inner ring-1 ring-black/[0.05]">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Total</p>
                      <p class="text-3xl font-black tabular-nums leading-none text-ink">{{ totalAnimes }}</p>
                      <p class="mt-0.5 text-[10px] font-medium text-ink-muted">en el corte</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="stats-badge-pop w-full rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-50 to-white px-3 py-2 text-center shadow-sm">
                <p class="text-[10px] font-bold uppercase tracking-wide text-violet-600">Diversidad</p>
                <p class="text-lg font-black leading-none text-ink">{{ estadoEntries.length }} estados distintos</p>
              </div>
            </div>
            <ul class="space-y-2.5">
              <li
                v-for="(item, ei) in estadoSegments"
                :key="item.label"
                class="stats-stagger stats-viz-legend-row overflow-hidden rounded-xl border border-border-subtle/90 bg-surface-muted/50 shadow-sm"
                :style="{ animationDelay: `${ei * 50}ms` }"
              >
                <div class="flex items-center justify-between gap-2 px-2.5 pt-2">
                  <div class="flex min-w-0 items-center gap-2">
                    <span
                      class="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ring-2 ring-white"
                      :style="{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}55` }"
                    />
                    <span class="truncate text-sm font-semibold text-ink">{{ item.label }}</span>
                  </div>
                  <div class="shrink-0 text-right">
                    <span class="text-sm font-black tabular-nums text-ink">{{ item.count }}</span>
                    <span class="ml-1 text-[11px] font-semibold text-ink-muted">{{ item.percent }}%</span>
                  </div>
                </div>
                <div class="mt-2 h-2 bg-black/[0.06]">
                  <div
                    class="stats-viz-legend-fill h-full rounded-r-full bg-gradient-to-r from-white/20 to-transparent shadow-sm"
                    :style="{
                      width: `${item.percent}%`,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`
                    }"
                  />
                </div>
              </li>
            </ul>
          </div>
        </article>

        <article
          class="stats-enter stats-viz-panel relative overflow-hidden rounded-2xl border border-border-subtle bg-elevated p-3 sm:p-4 shadow-card xl:col-span-6"
          style="animation-delay: 300ms"
        >
          <div
            class="pointer-events-none absolute -left-10 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-gradient-to-tr from-fuchsia-400/10 to-cyan-400/10 blur-3xl"
            aria-hidden="true"
          />
          <div class="relative mb-3">
            <h2 class="font-display text-lg font-semibold">Top temporadas</h2>
            <p class="mt-0.5 text-xs text-ink-muted">Etiquetas de temporada más usadas en el corte (barras relativas al máximo).</p>
          </div>
          <ul v-if="topTemporadasBars.length" class="relative space-y-2.5">
            <li
              v-for="(row, ti) in topTemporadasBars"
              :key="row.name"
              class="stats-stagger rounded-xl border border-border-subtle/90 bg-surface-muted/45 p-2.5 shadow-sm backdrop-blur-[1px]"
              :style="{ animationDelay: `${ti * 45}ms` }"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="min-w-0 truncate text-sm font-semibold text-ink">{{ row.name }}</span>
                <span
                  class="shrink-0 rounded-md px-2 py-0.5 text-xs font-black tabular-nums text-white shadow-sm"
                  :style="{ background: `linear-gradient(135deg, ${row.color}, ${row.color}cc)` }"
                >
                  {{ row.count }}
                </span>
              </div>
              <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-black/[0.07] ring-1 ring-inset ring-white/40">
                <div
                  class="stats-tempo-bar h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.08)]"
                  :style="{
                    width: `${row.barWidth}%`,
                    background: `linear-gradient(90deg, ${row.color}, ${row.color}99)`
                  }"
                />
              </div>
            </li>
          </ul>
          <p v-else class="relative rounded-xl border border-dashed border-border-subtle bg-surface-muted/40 px-4 py-8 text-center text-sm text-ink-muted">
            Aún no hay etiquetas de temporada para analizar en este corte.
          </p>
        </article>
      </section>

      <section class="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <article
          class="stats-enter stats-dq-panel relative overflow-hidden rounded-2xl border border-border-subtle bg-elevated p-3 shadow-card sm:p-4 xl:col-span-5"
          style="animation-delay: 340ms"
        >
          <div
            class="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-violet-400/15 via-transparent to-cyan-400/10 blur-2xl"
            aria-hidden="true"
          />
          <div class="relative mb-4 flex flex-wrap items-end justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-100 to-white text-violet-700 shadow-sm"
                aria-hidden="true"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 class="font-display text-lg font-semibold leading-tight">Completitud del catalogo</h2>
                <p class="mt-0.5 text-xs text-ink-muted">
                  Cuatro campos clave: cuantas fichas del corte tienen cada dato rellenado.
                </p>
              </div>
            </div>
            <div
              v-if="totalAnimes > 0"
              class="rounded-xl border border-border-subtle bg-surface-muted/60 px-3 py-2 text-right"
            >
              <p class="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Promedio</p>
              <p class="text-xl font-black tabular-nums leading-none text-ink">{{ dataQualityAverage }}%</p>
            </div>
          </div>

          <div class="relative grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div
              v-for="(metric, qi) in dataQualityMetrics"
              :key="metric.label"
              class="stats-stagger stats-dq-card flex gap-3 rounded-xl border border-border-subtle/80 bg-surface-muted/50 p-3 backdrop-blur-[2px]"
              :style="{ animationDelay: `${qi * 55}ms` }"
            >
              <div
                class="stats-dq-ring relative grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-full p-[3px] shadow-inner"
                :style="{
                  background: `conic-gradient(from -90deg, ${metric.ringColor} ${metric.percent}%, rgb(228 231 235) 0)`
                }"
                :aria-hidden="true"
              >
                <div
                  class="flex h-full w-full flex-col items-center justify-center rounded-full bg-elevated px-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.6)]"
                >
                  <span class="text-lg font-black tabular-nums leading-none text-ink">{{ metric.percent }}</span>
                  <span class="text-[9px] font-semibold uppercase tracking-wide text-ink-muted">%</span>
                </div>
              </div>
              <div class="min-w-0 flex-1 pt-0.5">
                <p class="text-sm font-semibold leading-snug text-ink">{{ metric.label }}</p>
                <p class="mt-1 text-[11px] text-ink-muted">
                  <span class="font-medium text-ink">{{ metric.count }}</span>
                  de {{ totalAnimes }} fichas
                </p>
                <div class="mt-2 h-1 overflow-hidden rounded-full bg-border-subtle/90">
                  <div
                    class="h-full rounded-full transition-[width] duration-500 ease-out"
                    :style="{
                      width: `${metric.percent}%`,
                      backgroundColor: metric.ringColor
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        <article
          class="stats-enter stats-viz-panel relative overflow-hidden rounded-2xl border border-border-subtle bg-elevated p-3 sm:p-4 shadow-card xl:col-span-4"
          style="animation-delay: 380ms"
        >
          <div
            class="pointer-events-none absolute right-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-bl from-amber-300/15 to-rose-400/10 blur-2xl"
            aria-hidden="true"
          />
          <div class="relative mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-display text-lg font-semibold">Series con más fichas</h2>
              <p class="text-[11px] text-ink-muted">Obras con más entradas en el corte.</p>
            </div>
            <span class="rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 ring-1 ring-amber-200/80">
              Top {{ topSeriesBySeasons.length }}
            </span>
          </div>
          <ol v-if="topSeriesBars.length" class="relative space-y-2">
            <li
              v-for="(item, idx) in topSeriesBars"
              :key="item.name"
              class="stats-stagger relative overflow-hidden rounded-xl border border-border-subtle/90 bg-surface-muted/50 py-2 pl-2 pr-2 shadow-sm"
              :style="{ animationDelay: `${idx * 50}ms` }"
            >
              <div
                class="stats-series-bar-bg pointer-events-none absolute inset-y-0 left-0 opacity-[0.18]"
                :style="{ width: `${item.barWidth}%`, background: item.barGradient }"
              />
              <div class="relative flex items-center gap-2">
                <span
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black tabular-nums shadow-sm ring-1 ring-black/[0.04]"
                  :class="item.rankClass"
                >
                  {{ idx + 1 }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold leading-tight text-ink">{{ item.name }}</p>
                  <p class="text-[10px] font-medium text-ink-muted">{{ item.seasons }} fichas en la obra</p>
                </div>
                <span
                  class="shrink-0 rounded-lg bg-elevated/95 px-2 py-1 text-base font-black tabular-nums text-ink shadow-sm ring-1 ring-black/[0.05]"
                >
                  {{ item.seasons }}
                </span>
              </div>
            </li>
          </ol>
          <p v-else class="relative rounded-xl border border-dashed border-border-subtle bg-surface-muted/40 px-3 py-6 text-center text-xs text-ink-muted">
            Sin datos suficientes para ranking.
          </p>
        </article>

        <article
          class="stats-enter stats-viz-panel relative overflow-hidden rounded-2xl border border-border-subtle bg-elevated p-3 sm:p-4 shadow-card xl:col-span-3"
          style="animation-delay: 420ms"
        >
          <div
            class="pointer-events-none absolute bottom-0 right-0 h-40 w-40 translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-tl from-emerald-400/10 via-transparent to-amber-300/10 blur-2xl"
            aria-hidden="true"
          />
          <div class="relative mb-4">
            <h2 class="font-display text-lg font-semibold">Semáforo del catálogo</h2>
            <p class="text-xs text-ink-muted">Cómo se reparte tu lista entre cerrados, en curso y pendientes.</p>
          </div>
          <!-- Barra apilada única -->
          <div
            v-if="totalAnimes > 0"
            class="stats-stagger relative mb-4 h-5 w-full overflow-hidden rounded-full bg-black/[0.08] shadow-inner ring-1 ring-inset ring-white/50"
            :style="{ animationDelay: '0ms' }"
          >
            <div v-if="healthStackSegments.length" class="flex h-full w-full">
              <div
                v-for="seg in healthStackSegments"
                :key="seg.key"
                class="h-full min-w-[2px] shadow-[inset_0_-2px_0_rgb(0_0_0/0.08)]"
                :style="{
                  flex: `${seg.count} 1 0%`,
                  background: seg.gradient
                }"
                :title="`${seg.label}: ${seg.count}`"
              />
            </div>
            <div v-else class="h-full w-full bg-gradient-to-r from-border-subtle to-surface-muted" />
          </div>
          <div class="relative space-y-2.5">
            <div
              v-for="(signal, si) in healthSignals"
              :key="signal.label"
              class="stats-stagger flex items-center gap-3 rounded-xl border px-3 py-2.5 shadow-sm backdrop-blur-[1px]"
              :class="signal.cardClass"
              :style="{ animationDelay: `${60 + si * 55}ms` }"
            >
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ring-2 ring-white/30"
                :class="signal.iconWrapClass"
              >
                <svg
                  v-if="signal.key === 'done'"
                  class="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg
                  v-else-if="signal.key === 'active'"
                  class="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg
                  v-else
                  class="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold uppercase tracking-wide text-ink-muted/90">{{ signal.label }}</p>
                <p class="text-2xl font-black leading-tight tabular-nums text-ink">{{ signal.value }}</p>
                <p class="text-[11px] leading-snug text-ink-muted">{{ signal.hint }}</p>
              </div>
            </div>
          </div>
        </article>
      </section>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAnimeStore } from '../stores/animeStore'
import { useErrorStore } from '../stores/errorStore'
import { AppShellKey } from '../injectionKeys'
import AppChrome from '../components/layout/AppChrome.vue'
import { formatDate } from '../utils/formatters'
import { groupAnimesByObra } from '../utils/animeGroup'

const shell = inject(AppShellKey)
if (!shell) {
  throw new Error('Stats requiere AppShell (App.vue)')
}

const router = useRouter()
const animeStore = useAnimeStore()
const errorStore = useErrorStore()

/** @type {import('vue').Ref<'full' | 'added' | 'premiere'>} */
const rangeScope = ref('full')
/** @type {import('vue').Ref<'30d' | '90d' | '365d' | 'this_year'>} */
const rangePreset = ref('365d')

/** Re-anima el panel al cambiar alcance/período */
const statsPanelKey = computed(() => `${rangeScope.value}-${rangePreset.value}`)

function startOfDay(d) {
  const x = new Date(d)
  return new Date(x.getFullYear(), x.getMonth(), x.getDate())
}

function endOfDay(d) {
  const x = new Date(d)
  return new Date(x.getFullYear(), x.getMonth(), x.getDate(), 23, 59, 59, 999)
}

function getPeriodBounds(preset) {
  const now = new Date()
  const end = endOfDay(now)
  const start = startOfDay(now)

  if (preset === '30d') {
    const s = new Date(start)
    s.setDate(s.getDate() - 30)
    return { start: s, end }
  }
  if (preset === '90d') {
    const s = new Date(start)
    s.setDate(s.getDate() - 90)
    return { start: s, end }
  }
  if (preset === '365d') {
    const s = new Date(start)
    s.setDate(s.getDate() - 365)
    return { start: s, end }
  }
  if (preset === 'this_year') {
    const s = new Date(now.getFullYear(), 0, 1)
    return { start: startOfDay(s), end }
  }
  return { start: startOfDay(now), end }
}

const rangeDescription = computed(() => {
  const { start, end } = getPeriodBounds(rangePreset.value)
  return `Mostrando datos del ${formatDate(start.toISOString().slice(0, 10))} al ${formatDate(end.toISOString().slice(0, 10))} (${labelPreset(rangePreset.value)}).`
})

function labelPreset(preset) {
  const labels = {
    '30d': 'últimos 30 días',
    '90d': 'últimos 90 días',
    '365d': 'últimos 365 días',
    this_year: 'año en curso'
  }
  return labels[preset] || preset
}

const filteredAnimes = computed(() => {
  const list = animeStore.animes || []
  if (rangeScope.value === 'full') return list

  const { start, end } = getPeriodBounds(rangePreset.value)

  return list.filter((a) => {
    if (rangeScope.value === 'added') {
      const c = a.created_at ? new Date(a.created_at) : null
      if (!c || Number.isNaN(c.getTime())) return false
      return c >= start && c <= end
    }
    if (rangeScope.value === 'premiere') {
      const p = a.fecha_estreno ? new Date(a.fecha_estreno) : null
      if (!p || Number.isNaN(p.getTime())) return false
      return p >= start && p <= end
    }
    return true
  })
})

function buildStatsFromAnimes(animes) {
  const total = animes.length
  const porEstado = {}
  const porTemporada = {}
  let totalTemporadas = 0

  animes.forEach((anime) => {
    const est = anime.estado ?? '(sin estado)'
    porEstado[est] = (porEstado[est] || 0) + 1
    if (anime.temporadas?.length) {
      anime.temporadas.forEach((temp) => {
        porTemporada[temp] = (porTemporada[temp] || 0) + 1
      })
      totalTemporadas += anime.temporadas.length
    }
  })

  return {
    total,
    porEstado,
    porTemporada,
    totalTemporadas,
    promedioTemporadas: total > 0 ? (totalTemporadas / total).toFixed(1) : 0
  }
}

const stats = computed(() => buildStatsFromAnimes(filteredAnimes.value))

const totalAnimes = computed(() => stats.value.total || 0)
const estadoEntries = computed(() => Object.entries(stats.value.porEstado || {}).sort((a, b) => b[1] - a[1]))
const topTemporadas = computed(() =>
  Object.entries(stats.value.porTemporada || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
)

const tempoBarPalette = ['#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#84cc16']

const topTemporadasBars = computed(() => {
  const rows = topTemporadas.value
  if (!rows.length) return []
  const max = Math.max(...rows.map(([, c]) => c), 1)
  return rows.map(([name, count], i) => ({
    name,
    count,
    barWidth: Math.round((count / max) * 100),
    color: tempoBarPalette[i % tempoBarPalette.length]
  }))
})

const seriesRankBarGradients = [
  'linear-gradient(90deg, rgba(251, 191, 36, 0.5), rgba(245, 158, 11, 0.12))',
  'linear-gradient(90deg, rgba(148, 163, 184, 0.45), rgba(100, 116, 139, 0.1))',
  'linear-gradient(90deg, rgba(251, 146, 60, 0.45), rgba(234, 88, 12, 0.12))',
  'linear-gradient(90deg, rgba(167, 139, 250, 0.28), rgba(167, 139, 250, 0.06))'
]

const seriesRankBadgeClass = [
  'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-md',
  'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-md',
  'bg-gradient-to-br from-orange-400 to-orange-700 text-orange-950 shadow-md',
  'bg-gradient-to-br from-violet-200 to-violet-400 text-violet-950 shadow-sm'
]

const topSeriesBars = computed(() => {
  const rows = topSeriesBySeasons.value
  if (!rows.length) return []
  const max = Math.max(...rows.map((r) => r.seasons), 1)
  return rows.map((r, idx) => ({
    ...r,
    barWidth: Math.round((r.seasons / max) * 100),
    barGradient: seriesRankBarGradients[Math.min(idx, 3)],
    rankClass: seriesRankBadgeClass[Math.min(idx, 3)]
  }))
})

const animesConFecha = computed(() => filteredAnimes.value.filter((anime) => anime.fecha_estreno))
const animesConEpisodios = computed(() => filteredAnimes.value.filter((anime) => Number(anime.episodios) > 0))
const animesConAnio = computed(() => filteredAnimes.value.filter((anime) => anime.anio || anime.year))
const animesConImagen = computed(() => filteredAnimes.value.filter((anime) => anime.imagen_url))

const premierDate = computed(() => {
  if (animesConFecha.value.length === 0) return 'N/D'
  const first = [...animesConFecha.value].sort((a, b) =>
    String(a.fecha_estreno || '').localeCompare(String(b.fecha_estreno || ''))
  )[0]
  return formatDate(first.fecha_estreno)
})

/** Obras con más fichas en el corte (misma lógica que la vista por series). No usar anime.temporadas.length: eso son etiquetas de config, no entradas por obra. */
const topSeriesBySeasons = computed(() => {
  const series = groupAnimesByObra(filteredAnimes.value)
  return series
    .map((serie) => ({
      name: serie.titulo_original || 'Sin nombre',
      seasons: serie.total_temporadas ?? serie.temporadas?.length ?? 0
    }))
    .filter((row) => row.seasons > 0)
    .sort((a, b) => b.seasons - a.seasons)
    .slice(0, 8)
})

const normalizedEstadoCounts = computed(() => {
  let done = 0
  let active = 0
  let backlog = 0
  estadoEntries.value.forEach(([estado, count]) => {
    const key = String(estado || '').toLowerCase()
    if (key.includes('visto') || key.includes('complet') || key.includes('final')) {
      done += count
    } else if (key.includes('emisi') || key.includes('viendo') || key.includes('siguiendo')) {
      active += count
    } else {
      backlog += count
    }
  })
  return { done, active, backlog }
})

const summaryCards = computed(() => [
  {
    label: 'Total animes',
    value: totalAnimes.value,
    hint: 'Cantidad en el corte actual',
    className: 'border-accent-border/30 bg-gradient-to-br from-accent-muted/55 to-accent-muted/15 text-accent',
    glowClass: 'bg-gradient-to-br from-violet-400 to-fuchsia-500',
    valueClass: 'bg-gradient-to-br from-violet-700 to-fuchsia-600 bg-clip-text text-transparent'
  },
  {
    label: 'Cobertura de fechas',
    value: `${percent(animesConFecha.value.length)}%`,
    hint: `${animesConFecha.value.length} con fecha de estreno`,
    className: 'border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-700',
    glowClass: 'bg-gradient-to-br from-sky-400 to-indigo-500',
    valueClass: 'text-sky-800'
  },
  {
    label: 'Prom. temporadas',
    value: stats.value.promedioTemporadas || 0,
    hint: `${stats.value.totalTemporadas || 0} temporadas acumuladas`,
    className: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700',
    glowClass: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    valueClass: 'text-emerald-800'
  },
  {
    label: 'Primer estreno',
    value: premierDate.value,
    hint: `${topTemporadas.value.length} etiquetas de temporada frecuentes`,
    className: 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700',
    glowClass: 'bg-gradient-to-br from-amber-400 to-orange-500',
    valueClass: 'text-amber-900'
  }
])

const palette = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6']
const estadoSegments = computed(() =>
  estadoEntries.value.map(([label, count], index) => ({
    label,
    count,
    percent: percent(count),
    color: palette[index % palette.length]
  }))
)

const estadoDonutGradient = computed(() => {
  if (estadoSegments.value.length === 0) return 'conic-gradient(#e5e7eb 0 100%)'
  let start = 0
  const chunks = estadoSegments.value.map((segment) => {
    const end = start + segment.percent
    const part = `${segment.color} ${start}% ${end}%`
    start = end
    return part
  })
  if (start < 100) chunks.push(`#e5e7eb ${start}% 100%`)
  return `conic-gradient(${chunks.join(', ')})`
})

const dataQualityMetrics = computed(() => {
  const defs = [
    {
      label: 'Fecha de estreno',
      ringColor: '#7c3aed',
      count: animesConFecha.value.length,
      percent: percent(animesConFecha.value.length)
    },
    {
      label: 'Episodios informados',
      ringColor: '#059669',
      count: animesConEpisodios.value.length,
      percent: percent(animesConEpisodios.value.length)
    },
    {
      label: 'Año informado',
      ringColor: '#d97706',
      count: animesConAnio.value.length,
      percent: percent(animesConAnio.value.length)
    },
    {
      label: 'Portada cargada',
      ringColor: '#db2777',
      count: animesConImagen.value.length,
      percent: percent(animesConImagen.value.length)
    }
  ]
  return defs
})

const dataQualityAverage = computed(() => {
  const rows = dataQualityMetrics.value
  if (!rows.length || totalAnimes.value === 0) return 0
  const sum = rows.reduce((acc, m) => acc + m.percent, 0)
  return Math.round(sum / rows.length)
})

const healthStackSegments = computed(() => {
  const { done, active, backlog } = normalizedEstadoCounts.value
  return [
    { key: 'done', label: 'Finalizados', count: done, gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)' },
    { key: 'active', label: 'En curso', count: active, gradient: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' },
    { key: 'backlog', label: 'Backlog', count: backlog, gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)' }
  ].filter((s) => s.count > 0)
})

const healthSignals = computed(() => {
  const { done, active, backlog } = normalizedEstadoCounts.value
  return [
    {
      key: 'done',
      label: 'Finalizados',
      value: `${percent(done)}%`,
      hint: `${done} animes cerrados`,
      cardClass: 'border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white',
      iconWrapClass: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      key: 'active',
      label: 'En curso',
      value: `${percent(active)}%`,
      hint: `${active} animes en seguimiento`,
      cardClass: 'border-sky-200/90 bg-gradient-to-br from-sky-50 to-white',
      iconWrapClass: 'bg-gradient-to-br from-sky-500 to-blue-600'
    },
    {
      key: 'backlog',
      label: 'Backlog',
      value: `${percent(backlog)}%`,
      hint: `${backlog} pendientes o por iniciar`,
      cardClass: 'border-amber-200/90 bg-gradient-to-br from-amber-50 to-white',
      iconWrapClass: 'bg-gradient-to-br from-amber-500 to-orange-600'
    }
  ]
})

function percent(value, total = totalAnimes.value) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

onMounted(async () => {
  try {
    await errorStore.handleError(() => animeStore.fetchAnimes(), 'Cargar Animes')
  } catch {
    // Error ya manejado por el store global
  }
})
</script>

<style scoped>
@keyframes stats-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-enter {
  animation: stats-enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

/* Transición al cambiar alcance / período */
.stats-panel-enter-active,
.stats-panel-leave-active {
  transition:
    opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.stats-panel-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.stats-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Listas y chips con escalonado */
.stats-stagger {
  animation: stats-stagger-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.stats-chip.stats-stagger {
  animation-name: stats-chip-in;
  animation-duration: 0.38s;
}

@keyframes stats-stagger-in {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes stats-chip-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Donut */
.stats-donut {
  animation: stats-donut-in 0.75s cubic-bezier(0.34, 1.4, 0.64, 1) 0.08s backwards;
}

@keyframes stats-donut-in {
  from {
    opacity: 0;
    transform: scale(0.82) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.stats-badge-pop {
  animation: stats-badge-pop 0.45s ease 0.32s backwards;
}

@keyframes stats-badge-pop {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Barras de calidad */
.stats-bar-fill {
  transform: scaleX(0);
  transform-origin: left center;
  animation: stats-bar-grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes stats-bar-grow {
  to {
    transform: scaleX(1);
  }
}

/* Tarjetas KPI */
.stats-card {
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}
.stats-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 14px 28px -14px rgb(15 23 42 / 0.12),
    0 0 0 1px rgb(15 23 42 / 0.04);
}

/* Botones de acción */
.stats-action-btn {
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
}
.stats-action-btn:active {
  transform: scale(0.97);
}

/* KPI cabecera */
.stats-kpi-value {
  text-shadow: 0 1px 0 rgb(255 255 255 / 0.5);
}

/* Donut + leyenda */
.stats-viz-donut-wrap {
  filter: drop-shadow(0 12px 24px rgb(15 23 42 / 0.08));
}

.stats-viz-legend-fill {
  min-width: 2px;
  animation: stats-viz-bar-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

.stats-tempo-bar {
  min-width: 4px;
  animation: stats-viz-bar-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes stats-viz-bar-in {
  from {
    transform: scaleX(0.2);
    opacity: 0.5;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

.stats-tempo-bar {
  transform-origin: left center;
}

@media (prefers-reduced-motion: reduce) {
  .stats-enter,
  .stats-stagger,
  .stats-chip.stats-stagger,
  .stats-donut,
  .stats-badge-pop,
  .stats-bar-fill {
    animation: none !important;
  }
  .stats-bar-fill {
    transform: scaleX(1) !important;
  }
  .stats-panel-enter-active,
  .stats-panel-leave-active {
    transition: opacity 0.15s ease !important;
  }
  .stats-panel-enter-from,
  .stats-panel-leave-to {
    transform: none !important;
  }
  .stats-card {
    transition: none;
  }
  .stats-card:hover {
    transform: none;
  }
  .stats-action-btn:active {
    transform: none;
  }
  .stats-viz-legend-fill,
  .stats-tempo-bar {
    animation: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
