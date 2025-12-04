/**
 * Script to pull color names from the uwdata/color-naming-in-different-languages dataset
 * and generate CSV, JSON, and SVG files per language
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Source data URL (note: the repo uses 'master' branch, not 'main')
const FULL_COLORS_INFO_URL = 'https://raw.githubusercontent.com/uwdata/color-naming-in-different-languages/master/model/full_colors_info.csv'

// Output directories
const DATA_DIR = join(__dirname, '..', 'data')
const JSON_DIR = join(__dirname, '..', 'json')
const SVG_DIR = join(__dirname, '..', 'svg')

// RTL languages
const RTL_LANGUAGES = new Set(['fa', 'ar', 'he', 'ur'])

// SVG template (based on farbnamen project)
const SVG_TEMPLATE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 {height}">
  <defs>
    <style type="text/css">
      @import url('https://rsms.me/inter/inter.css');
      text {
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 40px;
        font-weight: 900;
      }
    </style>
  </defs>
  <rect fill="#202124" x="0" y="0" width="600" height="{height}"/>
  {items}
</svg>`

interface ColorInfo {
  lang: string
  lang_abv: string
  simplifiedName: string
  commonName: string
  avgColorRGBCode: string
  totalColorFraction: string
  avgL: string
  avgA: string
  avgB: string
}

/**
 * Convert RGB string like "rgb(255, 128, 64)" to hex "#ff8040"
 * Handles out-of-range values by clamping to 0-255
 */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/)
  if (!match) {
    console.warn(`Could not parse RGB value: ${rgb}`)
    return '#000000'
  }
  
  // Parse and clamp values to 0-255
  const clamp = (n: number) => Math.max(0, Math.min(255, n))
  const r = clamp(parseInt(match[1], 10))
  const g = clamp(parseInt(match[2], 10))
  const b = clamp(parseInt(match[3], 10))
  
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

/**
 * Parse CSV string into array of objects
 */
function parseCSV(csv: string): ColorInfo[] {
  const lines = csv.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    // Handle potential commas within quoted values (like in rgb values)
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const obj: Record<string, string> = {}
    headers.forEach((header, i) => {
      obj[header] = values[i] || ''
    })
    
    return obj as unknown as ColorInfo
  })
}

/**
 * Group colors by language
 */
function groupByLanguage(colors: ColorInfo[]): Map<string, ColorInfo[]> {
  const grouped = new Map<string, ColorInfo[]>()
  
  for (const color of colors) {
    const lang = color.lang_abv || color.lang
    if (!grouped.has(lang)) {
      grouped.set(lang, [])
    }
    grouped.get(lang)!.push(color)
  }
  
  return grouped
}

/**
 * Generate CSV content for a language
 */
function generateCSV(colors: ColorInfo[]): string {
  const lines = ['name,hex']
  
  for (const color of colors) {
    const name = color.commonName || color.simplifiedName
    const hex = rgbToHex(color.avgColorRGBCode)
    // Escape name if it contains commas or quotes
    const escapedName = name.includes(',') || name.includes('"') 
      ? `"${name.replace(/"/g, '""')}"` 
      : name
    lines.push(`${escapedName},${hex}`)
  }
  
  return lines.join('\n')
}

/**
 * Generate JSON content for a language
 * Format: array of {name, hex} objects
 */
function generateJSON(colors: ColorInfo[]): string {
  const colorArray = colors.map(color => ({
    name: color.commonName || color.simplifiedName,
    hex: rgbToHex(color.avgColorRGBCode)
  }))
  
  return JSON.stringify(colorArray, null, 2)
}

/**
 * Generate SVG content for a language
 */
function generateSVG(colors: ColorInfo[], langAbv: string): string {
  const isRTL = RTL_LANGUAGES.has(langAbv)
  
  const items = colors.map((color, i) => {
    const name = (color.commonName || color.simplifiedName).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const hex = rgbToHex(color.avgColorRGBCode)
    
    if (isRTL) {
      // RTL: align text to the right with proper unicode-bidi for RTL scripts
      return `<text x="560" y="${20 + (i + 1) * 70}" fill="${hex}" text-anchor="end" xml:lang="fa" unicode-bidi="embed">${name}</text>`
    }
    return `<text x="40" y="${20 + (i + 1) * 70}" fill="${hex}">${name}</text>`
  }).join('\n  ')
  
  const height = colors.length * 70 + 80
  
  return SVG_TEMPLATE
    .replace(/{height}/g, String(height))
    .replace(/{items}/g, items)
}

/**
 * Get a clean filename for the language (without extension)
 */
function getLanguageBasename(langAbv: string, colors: ColorInfo[]): string {
  // Get the full language name from the first color entry
  const fullLang = colors[0]?.lang || langAbv
  
  // Extract the English name (before parentheses) and clean it
  const englishName = fullLang.split('(')[0].trim().toLowerCase().replace(/\s+/g, '-')
  
  return `${langAbv}-${englishName}`
}

async function main() {
  console.log('🎨 Pulling color names from uwdata/color-naming-in-different-languages...\n')
  
  // Fetch the data
  console.log(`📥 Fetching ${FULL_COLORS_INFO_URL}`)
  const response = await fetch(FULL_COLORS_INFO_URL)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
  }
  
  const csvData = await response.text()
  console.log(`✅ Fetched ${csvData.length} bytes\n`)
  
  // Parse the CSV
  const colors = parseCSV(csvData)
  console.log(`📊 Parsed ${colors.length} color entries\n`)
  
  // Group by language
  const byLanguage = groupByLanguage(colors)
  console.log(`🌍 Found ${byLanguage.size} languages:\n`)
  
  // Create output directories
  for (const dir of [DATA_DIR, JSON_DIR, SVG_DIR]) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }
  
  // Generate files for each language
  for (const [langAbv, langColors] of byLanguage) {
    const basename = getLanguageBasename(langAbv, langColors)
    
    // Generate CSV
    const csvPath = join(DATA_DIR, `${basename}.csv`)
    writeFileSync(csvPath, generateCSV(langColors), 'utf-8')
    
    // Generate JSON
    const jsonPath = join(JSON_DIR, `${basename}.json`)
    writeFileSync(jsonPath, generateJSON(langColors), 'utf-8')
    
    // Generate SVG
    const svgPath = join(SVG_DIR, `${basename}.svg`)
    writeFileSync(svgPath, generateSVG(langColors, langAbv), 'utf-8')
    
    console.log(`  ✅ ${basename} (${langColors.length} colors) - CSV, JSON, SVG${RTL_LANGUAGES.has(langAbv) ? ' [RTL]' : ''}`)
  }
  
  console.log(`\n🎉 Done!`)
  console.log(`  📁 CSV files: ${DATA_DIR}`)
  console.log(`  📁 JSON files: ${JSON_DIR}`)
  console.log(`  📁 SVG files: ${SVG_DIR}`)
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
