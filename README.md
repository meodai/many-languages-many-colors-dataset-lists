# Many Languages, Many Colors Dataset Lists

A collection of color name lists extracted from the [Many Languages, Many Colors](https://uwdata.github.io/color-naming-in-different-languages/) research project by the UW Data Lab.

## Installation

```bash
npm install many-languages-many-colors-dataset-lists
```

## Usage

### Import JSON data directly

```javascript
// Import a specific language's color list
import enColors from 'many-languages-many-colors-dataset-lists/json/en-english.json'
import deColors from 'many-languages-many-colors-dataset-lists/json/de-german.json'
import faColors from 'many-languages-many-colors-dataset-lists/json/fa-persian.json'

// Each file exports an array of { name, hex } objects
console.log(enColors[0]) // { name: "green", hex: "#5bc256" }
```

### Available languages

```javascript
// All available JSON imports:
import enColors from 'many-languages-many-colors-dataset-lists/json/en-english.json'
import koColors from 'many-languages-many-colors-dataset-lists/json/ko-korean.json'
import zhColors from 'many-languages-many-colors-dataset-lists/json/zh-chinese.json'
import esColors from 'many-languages-many-colors-dataset-lists/json/es-spanish.json'
import deColors from 'many-languages-many-colors-dataset-lists/json/de-german.json'
import frColors from 'many-languages-many-colors-dataset-lists/json/fr-french.json'
import faColors from 'many-languages-many-colors-dataset-lists/json/fa-persian.json'
import ruColors from 'many-languages-many-colors-dataset-lists/json/ru-russian.json'
import ptColors from 'many-languages-many-colors-dataset-lists/json/pt-portuguese.json'
import nlColors from 'many-languages-many-colors-dataset-lists/json/nl-dutch.json'
import svColors from 'many-languages-many-colors-dataset-lists/json/sv-swedish.json'
import plColors from 'many-languages-many-colors-dataset-lists/json/pl-polish.json'
import fiColors from 'many-languages-many-colors-dataset-lists/json/fi-finnish.json'
import roColors from 'many-languages-many-colors-dataset-lists/json/ro-romanian.json'
```

### TypeScript

```typescript
interface ColorEntry {
  name: string
  hex: string
}

import enColors from 'many-languages-many-colors-dataset-lists/json/en-english.json'
const colors: ColorEntry[] = enColors
```

### Load dynamically

```javascript
// Load at runtime (Node.js)
import { readFileSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const jsonPath = require.resolve('many-languages-many-colors-dataset-lists/json/en-english.json')
const colors = JSON.parse(readFileSync(jsonPath, 'utf-8'))
```

## Data Format

Each JSON file contains an array of color objects:

```json
[
  { "name": "green", "hex": "#5bc256" },
  { "name": "blue", "hex": "#2778e0" },
  { "name": "purple", "hex": "#9443c0" }
]
```

CSV and SVG files are also available in the `data/` and `svg/` directories.

## About the Data

The color names in this dataset come from a color perception survey conducted on [LabIntheWild](https://labinthewild.org/). Participants were shown colors and asked to name them in their native language. The researchers then processed this data to create probabilistic models of color naming across languages.

Each CSV file contains color names for a specific language with:

- **name**: The most common standardized spelling of the color term (`commonName` from source)
- **hex**: The average color for that term, converted to hex from `avgColorRGBCode`

### About the Average Color

The hex value represents the **perceptual center** of each color term — the "average" color that participants associated with that name. It's calculated by:

1. Collecting all RGB values that participants labeled with a given term
2. Converting to LAB color space (which better represents human color perception)
3. Computing the weighted average, balancing for the expected distribution of hue colors
4. Converting back to RGB

This means the hex value isn't just any example of "green" — it's the statistical center of what speakers of that language typically mean when they say "green".

## Available Languages

| File | Language | Color Terms | Data Points |
|------|----------|-------------|-------------|
| `en-english.csv` | English | 545 | 145,709 |
| `ko-korean.csv` | Korean | 146 | 13,507 |
| `zh-chinese.csv` | Chinese | 82 | 5,686 |
| `es-spanish.csv` | Spanish | 49 | 4,124 |
| `de-german.csv` | German | 49 | 3,721 |
| `fr-french.csv` | French | 45 | 2,968 |
| `fa-persian.csv` | Persian (Farsi) | 44 | 2,877 |
| `ru-russian.csv` | Russian | 27 | 1,682 |
| `pt-portuguese.csv` | Portuguese | 26 | 1,661 |
| `nl-dutch.csv` | Dutch | 19 | 1,096 |
| `sv-swedish.csv` | Swedish | 17 | 912 |
| `pl-polish.csv` | Polish | 16 | 1,085 |
| `fi-finnish.csv` | Finnish | 12 | 530 |
| `ro-romanian.csv` | Romanian | 4 | 227 |

> **Note**: The number of color terms varies significantly between languages due to the number of survey participants. English has the most data because it was the primary language of most participants. Only color terms with sufficient statistical data were included.

## Updating the Data

To pull the latest data from the source repository:

```bash
npm install
npm run pull-names
```

This fetches `full_colors_info.csv` from the [uwdata/color-naming-in-different-languages](https://github.com/uwdata/color-naming-in-different-languages) repository and generates one CSV per language.

## Source & Citation

If you use this data in published research, please cite the original paper:

> **Color Names Across Languages: Salient Colors and Term Translation in Multilingual Color Naming Models**  
> Younghoon Kim, Kyle Thayer, Gabriella Silva Gorsky, and Jeffrey Heer  
> EuroVis 2019  
> [Paper](http://idl.cs.washington.edu/papers/multi-lingual-color-names/) | [Project Page](https://uwdata.github.io/color-naming-in-different-languages/)

## License

The original dataset is provided by the UW Interactive Data Lab. Please refer to the [source repository](https://github.com/uwdata/color-naming-in-different-languages) for licensing information.
