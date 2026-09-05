<template>
  <div class="sf-app">
    <!-- NAVBAR -->
    <div class="sf-bar">
      <div class="sf-flex sf-items sf-gap-8">
        <svg width="16" height="30" viewBox="0 0 29 57" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.6985 39.904C20.3797 39.1179 20.8672 37.3346 20.8672 37.3346C21.2337 34.0174 23.7611 33.6719 24.1474 32.1922C24.7187 30.0128 20.028 27.8063 20.8672 26.624C21.7101 25.4418 23.8993 23.0958 25.4974 22.2319C27.0931 21.3706 25.8566 18.9987 24.3399 17.3808C22.8257 15.7617 22.6603 15.094 23.9635 13.6909C25.2679 12.2828 28.6641 10.6822 28.5715 8.96683C28.4851 7.25269 27.219 5.47315 25.5271 5.87423C23.766 6.29258 19.7972 10.0886 19.3962 11.9237C18.8001 14.6436 23.7315 16.5194 22.97 17.1204C22.0544 17.8485 18.1571 19.6453 16.7737 23.7215C16.0382 25.8861 21.3361 28.1 20.7438 28.9688C20.1526 29.8363 18.4471 31.0001 17.2995 33.1572C15.299 36.9113 17.8807 40.7987 22.6985 39.904Z" fill="var(--sf-text)"/>
          <path d="M22.1099 0C-13.8857 26.3612 1.57976 56.9392 16.0938 56.917C28.7912 56.8985 30.2351 43.2026 20.8351 41.9538C25.1099 43.4112 21.6878 48.1945 17.0354 48.1945C8.39064 48.1945 -7.61907 27.5508 22.1099 0Z" fill="var(--sf-text)"/>
        </svg>
        <div class="sf-flex sf-items sf-gap-8">
          <span class="sf-bold">Electricity Crisis (ElecRisis-26) Outages Tracker</span>
          <span class="navbar-beta">beta</span>
        </div>
      </div>
      <div style="flex:1;"></div>
      <div class="sf-flex sf-gap-4 sf-items">
        <button class="sf-btn sf-btn-icon sf-btn-sm" title="Search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
        <button class="sf-btn sf-btn-icon sf-btn-sm" title="Settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
    </div>

    <!-- BODY -->
    <div class="sf-body">
      <div class="card-row">
        <!-- LEFT — Info -->
        <div class="card-panel">
          <div class="sf-ch-section">Info</div>
          <template v-if="selectedRegion">
            <div class="selected-type">{{ selectedRegion.type === 'gov' ? 'Governorate' : 'Delegation' }}</div>
            <div class="selected-name">{{ selectedRegion.name }}</div>
            <div class="selected-status">
              <span class="status-dot" :style="{ background: colorMap[selectedRegion.status] || colorMap.unknown }"></span>
              <span>{{ statusLabel[selectedRegion.status] || statusLabel.unknown }}</span>
            </div>

            <template v-if="selectedRegion.type === 'gov'">
              <div class="del-summary" v-if="delCounts">
                <span class="del-summary-item" v-if="delCounts.on"><span class="chip-dot" style="background:#3ba55d"></span>{{ delCounts.on }} on</span>
                <span class="del-summary-item" v-if="delCounts.partial"><span class="chip-dot" style="background:#c9a84a"></span>{{ delCounts.partial }} partial</span>
                <span class="del-summary-item" v-if="delCounts.off"><span class="chip-dot" style="background:#c94a4a"></span>{{ delCounts.off }} off</span>
                <span class="del-summary-item" v-if="delCounts.unknown"><span class="chip-dot" style="background:#3a3a42"></span>{{ delCounts.unknown }} no data</span>
              </div>
              <div class="sf-divider" style="margin:10px 0;"></div>
              <div class="del-list">
                <div v-for="d in selectedRegion.delegations" :key="d.name" class="del-item">
                  <span class="del-dot" :style="{ background: colorMap[d.status] || colorMap.unknown }"></span>
                  <span class="sf-text-xs">{{ d.name }}</span>
                </div>
                <div v-if="!selectedRegion.delegations || !selectedRegion.delegations.length" class="sf-text-xs sf-text-dim">No delegation data</div>
              </div>
            </template>
            <template v-else>
              <div class="sf-divider" style="margin:10px 0;"></div>
              <div class="sf-text-xs sf-text-dim" style="margin-bottom:2px;">Governorate</div>
              <div class="del-item">
                <span class="sf-text-xs">{{ selectedRegion.gov }}</span>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="overview">
              <div class="overview-row">
                <div class="overview-stat">
                  <div class="overview-num">{{ stats.governorates || 24 }}</div>
                  <div class="overview-label">Governorates</div>
                </div>
                <div class="overview-stat">
                  <div class="overview-num">{{ stats.delegations || '—' }}</div>
                  <div class="overview-label">Delegations</div>
                </div>
              </div>
              <div class="sf-divider" style="margin:10px 0;"></div>
              <div class="status-row"><span class="status-dot" style="background:#3ba55d"></span><span class="sf-text-xs">On</span><span class="status-count">{{ stats.on ?? '—' }}</span></div>
              <div class="status-row"><span class="status-dot" style="background:#c9a84a"></span><span class="sf-text-xs">Partial</span><span class="status-count">{{ stats.partial ?? '—' }}</span></div>
              <div class="status-row"><span class="status-dot" style="background:#c94a4a"></span><span class="sf-text-xs">Off</span><span class="status-count">{{ stats.off ?? '—' }}</span></div>
              <div class="status-row"><span class="status-dot" style="background:#3a3a42"></span><span class="sf-text-xs">No data</span><span class="status-count">{{ stats.unknown ?? '—' }}</span></div>
              <div class="sf-text-xs sf-text-dim" style="margin-top:12px;">Select a region on the map for details</div>
            </div>
          </template>
        </div>

        <!-- MAIN — Map -->
        <div class="card-main">
          <div class="map-controls">
            <button class="map-ctrl-btn" :class="{ active: showDelegations }" @click="showDelegations = !showDelegations" title="Show delegation boundaries">
              <svg class="map-ctrl-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span class="map-ctrl-label">Delegations</span>
            </button>
            <button class="map-ctrl-btn" :class="{ active: showLabels }" @click="showLabels = !showLabels" title="Always show delegation names">
              <svg class="map-ctrl-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
              <span class="map-ctrl-label">Labels</span>
            </button>
          </div>
          <MapView
            :region-status="regionStatus"
            :show-delegations="showDelegations"
            :zoom-to="zoomTarget"
            :labels-on="showLabels"
            :filter-status="filterStatus"
            @select-region="onSelectRegion"
            @clear-selection="onClearSelection"
            @stats="onStats"
          />
          <div class="map-legend">
            <div class="map-legend-item"><span class="map-dot" style="background:#3ba55d;"></span>On</div>
            <div class="map-legend-item"><span class="map-dot" style="background:#c9a84a;"></span>Partial</div>
            <div class="map-legend-item"><span class="map-dot" style="background:#c94a4a;"></span>Off</div>
            <div class="map-legend-item"><span class="map-dot" style="background:#3a3a42;"></span>No data</div>
          </div>
        </div>

        <!-- RIGHT — Filters -->
        <div class="card-panel">
          <div class="sf-ch-section sf-flex sf-justify sf-items">
            <span>Filters</span>
            <button v-if="filterGov || filterStatus" class="filter-clear" @click="clearFilters">Clear</button>
          </div>

          <div class="filter-group">
            <label class="filter-label">Governorate</label>
            <select class="sf-select sf-w-full" v-model="filterGov">
              <option value="">All</option>
              <option v-for="g in governorates" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Status</label>
            <div class="sf-tabs sf-tabs-vertical">
              <button class="sf-tab" :class="{ 'sf-tab-active': filterStatus === '' }" @click="filterStatus = ''">
                All
              </button>
              <button class="sf-tab" :class="{ 'sf-tab-active': filterStatus === 'on' }" @click="toggleStatus('on')">
                <span class="chip-dot" style="background:#3ba55d"></span>On
              </button>
              <button class="sf-tab" :class="{ 'sf-tab-active': filterStatus === 'partial' }" @click="toggleStatus('partial')">
                <span class="chip-dot" style="background:#c9a84a"></span>Partial
              </button>
              <button class="sf-tab" :class="{ 'sf-tab-active': filterStatus === 'off' }" @click="toggleStatus('off')">
                <span class="chip-dot" style="background:#c94a4a"></span>Off
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- STATUS BAR -->
    <div class="sf-status-bar sf-border-top sf-flex sf-items sf-justify sf-px-16">
      <span class="sf-text-xs sf-text-dim">KiraiEEE</span>
      <span class="sf-text-xs sf-text-dim" v-if="stats.delegations">{{ stats.delegations }} delegations · {{ stats.governorates }} governorates</span>
      <span class="sf-text-xs sf-text-dim">v0.1</span>
    </div>
  </div>
</template>

<script setup>
const showDelegations = ref(true)
const showLabels = ref(false)
const filterGov = ref('')
const filterStatus = ref('')
const selectedRegion = ref(null)
const zoomTarget = ref('')
const stats = ref({})

const governorates = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès',
  'Gafsa', 'Jendouba', 'Kairouan', 'Kasserine', 'Kebili',
  'Kef', 'Mahdia', 'Manouba', 'Médenine', 'Monastir',
  'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse',
  'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
]

const colorMap = { on: '#3ba55d', off: '#c94a4a', partial: '#c9a84a', unknown: '#3a3a42' }
const statusLabel = { on: 'Power On', off: 'Power Off', partial: 'Partial Outage', unknown: 'No data' }

// Mock data — real-time feed will replace this later
const regionStatus = ref({
  'Tunis': 'on', 'Ben Arous': 'on', 'Ariana Médina': 'on', 'Manouba': 'on',
  'Nabeul': 'on', 'Zaghouan': 'off', 'Bizerte Nord': 'on', 'Bizerte Sud': 'on',
  'Béja Nord': 'partial', 'Béja Sud': 'off', 'Jendouba Nord': 'off', 'Jendouba Sud': 'off',
  'Aïn Draham': 'off', 'Kef Est': 'off', 'Kef Ouest': 'off',
  'Siliana Nord': 'partial', 'Siliana Sud': 'partial',
  'Sousse Médina': 'on', 'Sousse Jaouhara': 'on', 'Monastir': 'on', 'Mahdia': 'partial',
  'Kairouan Nord': 'off', 'Kairouan Sud': 'off', 'Sidi Bouzid Est': 'partial',
  'Sidi Bouzid Ouest': 'off', 'Kasserine Nord': 'off', 'Kasserine Sud': 'off',
  'Sfax Médina': 'on', 'Sfax Ouest': 'on', 'Sfax Sud': 'partial',
  'Gafsa Nord': 'off', 'Gafsa Sud': 'off', 'Tozeur': 'partial',
  'Kebili Nord': 'off', 'Kebili Sud': 'off', 'Tataouine Nord': 'off', 'Tataouine Sud': 'off',
  'Médenine Nord': 'partial', 'Médenine Sud': 'partial', 'Gabès Médina': 'partial', 'Gabès Sud': 'on',
  'Hammamet': 'on', 'Korba': 'on', 'El Alia': 'on', 'Mateur': 'on',
  'Hammam Lif': 'on', 'La Marsa': 'on', 'Carthage': 'on', 'Radès': 'on',
  'Mégrine': 'on', 'La Goulette': 'partial'
})

const delCounts = computed(() => {
  if (!selectedRegion.value?.delegations?.length) return null
  const c = { on: 0, off: 0, partial: 0, unknown: 0 }
  for (const d of selectedRegion.value.delegations) c[d.status]++
  return c
})

watch(filterGov, (val) => {
  zoomTarget.value = val
})

function toggleStatus(s) {
  filterStatus.value = filterStatus.value === s ? '' : s
}

function clearFilters() {
  filterGov.value = ''
  filterStatus.value = ''
}

function onSelectRegion(data) {
  selectedRegion.value = data
}

function onClearSelection() {
  selectedRegion.value = null
}

function onStats(data) {
  stats.value = data
}
</script>

<style>
.sf-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sf-body {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}

.card-row {
  display: grid;
  grid-template-columns: 220px 1fr 260px;
  gap: 16px;
  height: 100%;
}

.card-panel,
.card-main {
  background-color: var(--sf-bg-alt);
  border: 1px solid var(--sf-border);
  padding: 16px;
  overflow: hidden;
}

.card-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.map-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 5;
}
.map-ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 9px;
  border-radius: 16px;
  border: 1px solid var(--sf-border);
  background: var(--sf-bg-alt);
  color: var(--sf-text-dim);
  cursor: pointer;
  white-space: nowrap;
  gap: 6px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.map-ctrl-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
.map-ctrl-btn:hover {
  background: var(--sf-surface);
  color: var(--sf-text);
}
.map-ctrl-btn.active {
  background: var(--sf-brand);
  border-color: var(--sf-brand);
  color: white;
}
.map-ctrl-btn.active:hover {
  background: var(--sf-brand-hover);
}
.map-ctrl-label {
  font-size: 0.7rem;
  font-weight: 500;
}

.map-legend {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  width: 100%;
}
.map-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: var(--sf-text-dim);
}
.map-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.sf-status-bar {
  height: 28px;
  min-height: 28px;
  background-color: var(--sf-bg-bar);
}

.sf-btn-icon.sf-btn-sm {
  width: 30px;
  height: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.navbar-beta {
  font-size: 0.5rem;
  opacity: 0.4;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  align-self: flex-end;
  margin-bottom: 2px;
  line-height: 1;
}

.filter-group {
  margin-top: 4px;
  margin-bottom: 12px;
}
.filter-label {
  display: block;
  font-size: 0.7rem;
  color: var(--sf-text-sec);
  margin-bottom: 6px;
  font-weight: 600;
}
.filter-clear {
  background: none;
  border: none;
  color: var(--sf-text-dim);
  font-size: 0.65rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
.filter-clear:hover { color: var(--sf-text); }

.sf-tabs-vertical .sf-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
}
.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.selected-type {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--sf-text-dim);
  font-weight: 600;
  margin-bottom: 2px;
}
.selected-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--sf-text);
  margin-bottom: 4px;
}
.selected-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.del-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 10px;
}
.del-summary-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--sf-text-sec);
}

.del-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: calc(100vh - 320px);
  overflow-y: auto;
}
.del-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}
.del-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.overview-row {
  display: flex;
  gap: 12px;
}
.overview-stat {
  flex: 1;
}
.overview-num {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--sf-text);
  line-height: 1.2;
}
.overview-label {
  font-size: 0.65rem;
  color: var(--sf-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}
.status-row .status-count {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--sf-text-sec);
  font-weight: 600;
}

.filter-group .sf-select {
  padding: 6px 10px;
  font-size: 0.8rem;
}
</style>
