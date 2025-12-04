// Library entry point - Color names in different languages
// Data files are in: data/, json/, svg/

export interface ColorEntry {
  name: string
  hex: string
}

// Re-export types for consumers
export type { ColorEntry as Color }
