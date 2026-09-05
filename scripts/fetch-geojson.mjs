import { writeFileSync } from 'fs'
import { join } from 'path'

const PUBLIC = join(import.meta.dirname, '..', 'public')

const GOV_URL = 'https://raw.githubusercontent.com/mtimet/tnacmaps/master/geojson/governorates.geojson'
const DEL_URL = 'https://raw.githubusercontent.com/mtimet/tnacmaps/master/geojson/delegations.geojson'

const GOV_NAME_MAP = {
  'Tunis': 'Tunis',
  'Ariana': 'Ariana',
  'Ben Arous': 'Ben Arous',
  'Manubah': 'Manouba',
  'La Manouba': 'Manouba',
  'Zaghouan': 'Zaghouan',
  'Bizerte': 'Bizerte',
  'Nabeul': 'Nabeul',
  'Béja': 'Béja',
  'Beja': 'Béja',
  'Jendouba': 'Jendouba',
  'Le Kef': 'Le Kef',
  'Siliana': 'Siliana',
  'Kairouan': 'Kairouan',
  'Kasserine': 'Kasserine',
  'Sidi Bouzid': 'Sidi Bouzid',
  'Sousse': 'Sousse',
  'Monastir': 'Monastir',
  'Mahdia': 'Mahdia',
  'Sfax': 'Sfax',
  'Gafsa': 'Gafsa',
  'Gabès': 'Gabès',
  'Gabes': 'Gabès',
  'Médenine': 'Médenine',
  'Medenine': 'Médenine',
  'Tataouine': 'Tataouine',
  'Tozeur': 'Tozeur',
  'Kebili': 'Kebili',
  'Kébili': 'Kebili',
}

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}

function mergeFeatures(features) {
  const grouped = {}
  for (const f of features) {
    const rawName = f.properties.gov_name_f || f.properties.gouv_fr || f.properties.name || 'Unknown'
    const name = GOV_NAME_MAP[rawName] || rawName
    if (!grouped[name]) {
      grouped[name] = { ...f, properties: { gouv_fr: name, gouv_id: f.properties.gov_id || f.properties.gouv_id }, geometries: [] }
    }
    const geom = f.geometry
    if (geom.type === 'MultiPolygon') {
      grouped[name].geometries.push(...geom.coordinates)
    } else if (geom.type === 'Polygon') {
      grouped[name].geometries.push(geom.coordinates)
    }
  }

  const merged = []
  for (const [name, data] of Object.entries(grouped)) {
    merged.push({
      type: 'Feature',
      properties: data.properties,
      geometry: data.geometries.length === 1
        ? { type: 'Polygon', coordinates: data.geometries[0] }
        : { type: 'MultiPolygon', coordinates: data.geometries }
    })
  }
  return merged
}

async function main() {
  console.log('Fetching governorates...')
  const govData = await fetchJSON(GOV_URL)
  console.log(`  Got ${govData.features.length} features`)

  const govMerged = mergeFeatures(govData.features)
  console.log(`  Merged to ${govMerged.length} unique governorates`)
  for (const f of govMerged) {
    console.log(`    - ${f.properties.gouv_fr} (${f.geometry.type})`)
  }

  const govOut = { type: 'FeatureCollection', features: govMerged }
  writeFileSync(join(PUBLIC, 'tunisia-governorates.geojson'), JSON.stringify(govOut))
  console.log('  Saved tunisia-governorates.geojson')

  console.log('\nFetching delegations...')
  const delData = await fetchJSON(DEL_URL)
  console.log(`  Got ${delData.features.length} features`)

  const delFeatures = delData.features.map(f => {
    const name = f.properties.deleg_na_1 || f.properties.deleg_name || 'Unknown'
    const gov = GOV_NAME_MAP[f.properties.gov_name_f] || f.properties.gov_name_f || 'Unknown'
    return {
      type: 'Feature',
      properties: {
        del_fr: name,
        gouv_fr: gov,
        deleg_id: f.properties.deleg_id,
        gov_id: f.properties.gov_id
      },
      geometry: f.geometry
    }
  })

  const delOut = { type: 'FeatureCollection', features: delFeatures }
  writeFileSync(join(PUBLIC, 'tunisia-delegations.geojson'), JSON.stringify(delOut))
  console.log(`  Saved tunisia-delegations.geojson (${delFeatures.length} delegations)`)

  console.log('\nDone!')
}

main().catch(e => { console.error(e); process.exit(1) })
