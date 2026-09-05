<template>
  <div
    class="map-container"
    ref="containerRef"
    :class="{ 'is-dragging': isDragging }"
  >
    <svg
      ref="svgRef"
      v-if="govPaths.length"
      viewBox="0 0 500 600"
      preserveAspectRatio="xMidYMid meet"
      class="map-svg"
      @click="onVoidClick"
    >
      <g :transform="`translate(${transform.x} ${transform.y}) scale(${transform.k})`">
        <g>
          <path
            v-for="(p, i) in govPaths"
            :key="i"
            :d="p.d"
            :fill="govFill(p)"
            :stroke="selectedName === p.name ? '#5865f2' : '#26262e'"
            :stroke-width="(selectedName === p.name ? 1.5 : 0.8) / transform.k"
            stroke-linejoin="round"
            class="gov-path"
            @pointerenter="onGovHover(p)"
            @pointerleave="onLeave"
            @click="onGovClick(p, $event)"
          />
        </g>
        <g v-if="showDelegations">
          <path
            v-for="(p, i) in delPaths"
            :key="'d'+i"
            :d="p.d"
            :fill="delFill(p)"
            :stroke="selectedName === p.name ? '#5865f2' : '#1c1c22'"
            :stroke-width="(selectedName === p.name ? 0.8 : 0.3) / transform.k"
            stroke-linejoin="round"
            class="del-path"
            @pointerenter="onDelHover(p)"
            @pointerleave="onLeave"
            @click="onDelClick(p, $event)"
          />
        </g>
        <g>
          <text
            v-for="(p, i) in govPaths"
            :key="'gl'+i"
            :x="p.cx"
            :y="p.cy"
            class="gov-label"
            :style="{ fontSize: (8 / transform.k) + 'px', strokeWidth: (2 / transform.k) + 'px' }"
          >{{ p.name }}</text>
        </g>
        <g v-if="showDelLabels">
          <text
            v-for="(p, i) in delLabelPaths"
            :key="'dl'+i"
            :x="p.cx"
            :y="p.cy"
            class="del-label"
            :style="{ fontSize: (4.5 / transform.k) + 'px', strokeWidth: (1.5 / transform.k) + 'px' }"
          >{{ p.name }}</text>
        </g>
      </g>
    </svg>

    <div v-else class="map-loading">
      <div class="loader">
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
      </div>
    </div>

    <div class="map-hover-text" v-if="hoveredName && !isDragging">
      {{ hoveredName }}<template v-if="hoveredStatus"> &middot; {{ hoveredStatus }}</template>
    </div>

    <div
      v-if="popupData"
      class="map-popup sf-card"
      :style="{ left: popupPos.x + 'px', top: popupPos.y + 'px', borderLeftColor: popupData.color }"
      @pointerdown.stop
      @click.stop
    >
      <div class="popup-header">
        <span class="popup-type">{{ popupData.type === 'gov' ? 'Governorate' : 'Delegation' }}</span>
        <button class="popup-close" @click="clearPopup">&times;</button>
      </div>
      <div class="popup-name">{{ popupData.name }}</div>
      <div v-if="popupData.gov" class="popup-gov">{{ popupData.gov }}</div>
      <div class="popup-status sf-badge" :style="{ backgroundColor: popupData.color, borderColor: popupData.color }">
        {{ popupData.statusLabel }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { geoMercator, geoPath } from 'd3-geo'
import { select } from 'd3-selection'
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom'

const props = defineProps({
  regionStatus: { type: Object, default: () => ({}) },
  showDelegations: { type: Boolean, default: true },
  zoomTo: { type: String, default: '' },
  labelsOn: { type: Boolean, default: false },
  filterStatus: { type: String, default: '' }
})

const emit = defineEmits(['select-region', 'clear-selection', 'stats'])

const containerRef = ref(null)
const svgRef = ref(null)
const govPaths = ref([])
const delPaths = ref([])
const delLabelPaths = ref([])

const W = 500, H = 600
const K_MIN = 0.2, K_MAX = 8

const DIACRITICS_RE = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g')

function normName(s) {
  return s.normalize('NFD').replace(DIACRITICS_RE, '').replace('Sidi Bou Zid', 'Sidi Bouzid').replace('Le Kef', 'Kef')
}

const C = { on: '#3ba55d', off: '#c94a4a', partial: '#c9a84a', unknown: '#3a3a42' }
const L = { on: 'On', off: 'Off', partial: 'Partial', unknown: 'No data' }
const GOV_BASE = { r: 0x1c, g: 0x1c, b: 0x22 }

const transform = ref({ x: 0, y: 0, k: 1 })
let zoomBehavior = null

const hoveredName = ref('')
const hoveredStatus = ref('')
const selectedName = ref('')
const popupData = ref(null)
const popupPos = ref({ x: 0, y: 0 })
const isDragging = ref(false)

const showDelLabels = computed(() => props.labelsOn || transform.value.k > 1.4)

const govAgg = computed(() => {
  const map = {}
  for (const gov of govPaths.value) {
    const known = delPaths.value.filter(d => d.gov === gov.name && d.status !== 'unknown').map(d => d.status)
    if (known.length === 0) map[gov.name] = 'unknown'
    else map[gov.name] = known.every(s => s === known[0]) ? known[0] : 'partial'
  }
  return map
})

function delegationsOf(govName) {
  return delPaths.value.filter(d => d.gov === govName).map(d => ({ name: d.name, status: d.status }))
}

function mix(hex, ratio) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
  const mr = Math.round(GOV_BASE.r + (r - GOV_BASE.r) * ratio)
  const mg = Math.round(GOV_BASE.g + (g - GOV_BASE.g) * ratio)
  const mb = Math.round(GOV_BASE.b + (b - GOV_BASE.b) * ratio)
  return `rgb(${mr}, ${mg}, ${mb})`
}

function govFill(p) {
  if (props.filterStatus && !delPaths.value.some(d => d.gov === p.name && d.status === props.filterStatus)) {
    return '#1c1c22'
  }
  const status = govAgg.value[p.name] || 'unknown'
  if (status === 'unknown') {
    if (selectedName.value === p.name) return '#2e2e3a'
    if (hoveredName.value === p.name) return '#242430'
    return '#1c1c22'
  }
  const color = C[status]
  if (selectedName.value === p.name) return mix(color, 0.55)
  if (hoveredName.value === p.name) return mix(color, 0.4)
  return mix(color, 0.22)
}

function delFill(p) {
  if (props.filterStatus && p.status !== props.filterStatus) return '#232328'
  if (selectedName.value === p.name) return brighten(p.fill, 50)
  if (hoveredName.value === p.name) return brighten(p.fill, 30)
  return p.fill
}

function brighten(hex, amount = 30) {
  if (!hex || hex === C.unknown) return hex
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
  return `rgb(${r}, ${g}, ${b})`
}

function onGovHover(p) {
  if (isDragging.value) return
  hoveredName.value = p.name
  hoveredStatus.value = L[govAgg.value[p.name] || 'unknown']
}

function onDelHover(p) {
  if (isDragging.value) return
  hoveredName.value = p.name
  hoveredStatus.value = L[p.status] || L.unknown
}

function onLeave() {
  hoveredName.value = ''
  hoveredStatus.value = ''
}

function getPopupPos(e) {
  const rect = containerRef.value.getBoundingClientRect()
  let x = e.clientX - rect.left + 12
  let y = e.clientY - rect.top - 10
  x = Math.min(x, rect.width - 190)
  y = Math.max(10, Math.min(y, rect.height - 90))
  return { x, y }
}

function onGovClick(p, e) {
  const status = govAgg.value[p.name] || 'unknown'
  selectedName.value = p.name
  popupPos.value = getPopupPos(e)
  popupData.value = {
    name: p.name, type: 'gov', status,
    statusLabel: L[status] || L.unknown,
    color: C[status] || C.unknown, gov: null
  }
  emit('select-region', { name: p.name, type: 'gov', status, delegations: delegationsOf(p.name) })
}

function onDelClick(p, e) {
  selectedName.value = p.name
  popupPos.value = getPopupPos(e)
  popupData.value = {
    name: p.name, type: 'del', status: p.status,
    statusLabel: L[p.status] || L.unknown,
    color: C[p.status] || C.unknown, gov: p.gov
  }
  emit('select-region', { name: p.name, type: 'del', status: p.status, gov: p.gov })
}

function clearPopup() {
  popupData.value = null
  selectedName.value = ''
  emit('clear-selection')
}

function onVoidClick(e) {
  if (e.target === svgRef.value) clearPopup()
}

function applyTransform(t, animate = true) {
  if (!zoomBehavior || !svgRef.value) return
  const sel = select(svgRef.value)
  if (animate) sel.transition().duration(450).call(zoomBehavior.transform, t)
  else sel.call(zoomBehavior.transform, t)
}

function zoomToGov(rawName) {
  const gov = govPaths.value.find(p => p.name === normName(rawName))
  if (!gov) return
  const [[x0, y0], [x1, y1]] = gov.bounds
  const pad = 40
  const bw = (x1 - x0) + pad * 2
  const bh = (y1 - y0) + pad * 2
  const k = Math.min(K_MAX, Math.max(K_MIN, Math.min(W / bw, H / bh)))
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  applyTransform(zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-cx, -cy))
}

function resetZoom() {
  applyTransform(zoomIdentity)
}

watch(() => props.zoomTo, (val) => {
  if (val) zoomToGov(val)
  else resetZoom()
})

onMounted(async () => {
  const [govRes, delRes] = await Promise.all([
    fetch('/tunisia-governorates.geojson'),
    fetch('/tunisia-delegations.geojson')
  ])
  const govData = await govRes.json()
  const delData = await delRes.json()

  const PAD = 10
  const proj = geoMercator().fitExtent([[PAD, PAD], [W - PAD, H - PAD]], govData)
  const pathGen = geoPath(proj)

  govPaths.value = govData.features.map(f => {
    const name = normName(f.properties.gouv_fr)
    const id = f.properties.gouv_id
    const centroid = pathGen.centroid(f)
    const bounds = pathGen.bounds(f)
    return { d: pathGen(f), name, id, cx: centroid[0], cy: centroid[1], bounds }
  })

  delPaths.value = delData.features.map(f => {
    const name = f.properties.del_fr
    const gov = normName(f.properties.gouv_fr)
    const status = props.regionStatus[name] || 'unknown'
    const centroid = pathGen.centroid(f)
    const bounds = pathGen.bounds(f)
    return { d: pathGen(f), name, gov, fill: C[status], status, cx: centroid[0], cy: centroid[1], bounds }
  })

  delLabelPaths.value = delPaths.value.filter(p => p.cx && p.cy && isFinite(p.cx) && isFinite(p.cy))

  const stats = { on: 0, off: 0, partial: 0, unknown: 0 }
  for (const p of delPaths.value) stats[p.status]++
  emit('stats', { ...stats, delegations: delPaths.value.length, governorates: govPaths.value.length })

  await nextTick()
  zoomBehavior = d3zoom()
    .scaleExtent([K_MIN, K_MAX])
    .clickDistance(6)
    .on('zoom', (event) => {
      transform.value = event.transform
      if (event.sourceEvent && event.sourceEvent.type !== 'wheel') isDragging.value = true
    })
    .on('end', () => { isDragging.value = false })

  select(svgRef.value).call(zoomBehavior).on('dblclick.zoom', null)
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.map-svg {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  touch-action: none;
}
.map-container.is-dragging .map-svg {
  cursor: grabbing;
}
.map-container.is-dragging .gov-path,
.map-container.is-dragging .del-path {
  cursor: grabbing;
}

.map-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loader {
  position: relative;
  width: 36px;
  height: 36px;
}
.loader-ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top-color: var(--sf-text-dim);
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}
.loader-ring:nth-child(2) {
  inset: 4px;
  border-top-color: var(--sf-text-sec);
  animation-delay: -0.15s;
}
.loader-ring:nth-child(3) {
  inset: 8px;
  border-top-color: var(--sf-brand);
  animation-delay: -0.3s;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.gov-path {
  cursor: pointer;
}
.del-path {
  cursor: pointer;
}
.gov-label {
  fill: var(--sf-text);
  text-anchor: middle;
  pointer-events: none;
  paint-order: stroke;
  stroke: var(--sf-bg-alt);
  stroke-linejoin: round;
}
.del-label {
  fill: var(--sf-text-dim);
  text-anchor: middle;
  pointer-events: none;
  paint-order: stroke;
  stroke: var(--sf-bg-alt);
  stroke-linejoin: round;
}

.map-hover-text {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: var(--sf-text-sec);
  pointer-events: none;
  white-space: nowrap;
}

.map-popup {
  position: absolute;
  margin: 0;
  padding: 10px 14px;
  min-width: 150px;
  z-index: 10;
  border-left: 3px solid;
  animation: popup-in 0.12s ease;
}
@keyframes popup-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.popup-type {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--sf-text-dim);
  font-weight: 600;
}
.popup-close {
  background: none;
  border: none;
  color: var(--sf-text-dim);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0 2px;
}
.popup-close:hover { color: var(--sf-text); }
.popup-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--sf-text);
  margin-bottom: 2px;
}
.popup-gov {
  font-size: 0.7rem;
  color: var(--sf-text-dim);
  margin-bottom: 6px;
}
.popup-status {
  color: white !important;
  text-shadow: none;
  font-size: 0.7rem;
}
</style>
