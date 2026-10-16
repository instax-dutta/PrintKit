import type { ComponentType, LazyExoticComponent } from 'react'
import { lazy } from 'react'

export type Tool = {
  slug: string
  name: string
  desc: string
  keywords: string
  Component: LazyExoticComponent<ComponentType>
}

const Converter = lazy(() => import('./Convert'))
const ScaleTool = lazy(() => import('./Scale'))
const FilamentTool = lazy(() => import('./Filament'))
const CostTool = lazy(() => import('./Cost'))
const ShrinkageTool = lazy(() => import('./Shrinkage'))
const ToleranceTool = lazy(() => import('./Tolerance'))
const FlowTool = lazy(() => import('./Flow'))
const CalibrationTool = lazy(() => import('./Calibration'))
const LayersTool = lazy(() => import('./Layers'))
const WeightTool = lazy(() => import('./Weight'))
const ReferenceTool = lazy(() => import('./Reference'))
const SettingsTool = lazy(() => import('./Settings'))
const PresetsTool = lazy(() => import('./Presets'))

export const TOOLS: Tool[] = [
  { slug: 'convert', name: 'Length Converter', desc: 'mm, cm, m, inches (with fractions), feet and microns', keywords: 'mm cm meter inch fraction convert micrometer', Component: Converter },
  { slug: 'scale', name: 'Scale Calculator', desc: 'Scale %, target size, fit to build volume', keywords: 'scale resize fit build volume enlarge', Component: ScaleTool },
  { slug: 'filament', name: 'Filament Calculator', desc: 'Weight, length, volume conversion; spool remaining', keywords: 'weight grams metres meters spool remaining diameter', Component: FilamentTool },
  { slug: 'cost', name: 'Print Cost', desc: 'Material plus power quote with margin and markup', keywords: 'cost price electricity quote g/kg kWh', Component: CostTool },
  { slug: 'shrinkage', name: 'Shrinkage Compensation', desc: 'Model dimension and scale % for shrinkage', keywords: 'shrink compensation scale dimension', Component: ShrinkageTool },
  { slug: 'tolerance', name: 'Tolerance / Fit Helper', desc: 'Hole and shaft dimensions for press, snug, slip, loose fits', keywords: 'clearance fit hole shaft tolerance', Component: ToleranceTool },
  { slug: 'flow', name: 'Flow Rate', desc: 'mm³/s used at a speed, or max speed for hotend limits', keywords: 'flow mm3 speed limit hotend', Component: FlowTool },
  { slug: 'calibration', name: 'Calibration Helper', desc: 'E-steps, Klipper rotation distance, axis steps/mm', keywords: 'esteps e steps klipper rotation distance steps calibration', Component: CalibrationTool },
  { slug: 'layers', name: 'Layer & Time Helper', desc: 'Layer count, top-layer Z, rough time; layer sanity check', keywords: 'layers estimate time height', Component: LayersTool },
  { slug: 'weight', name: 'Weight From Model Volume', desc: 'Estimate grams and cost from model volume and infill', keywords: 'volume infill grams cost estimate', Component: WeightTool },
  { slug: 'reference', name: 'Reference Sheets', desc: 'Material temps, screw/insert holes, nozzle pairing', keywords: 'cheat sheet temp drying holes insert magnet nozzle', Component: ReferenceTool },
  { slug: 'presets', name: 'Presets', desc: 'Manage materials and printers used by tools', keywords: 'materials printers settings presets', Component: PresetsTool },
  { slug: 'settings', name: 'Settings', desc: 'Currency, units, storage import/export, theme', keywords: 'settings currency decimals theme import export', Component: SettingsTool },
]

export const forSlug = (slug: string): Tool | undefined => TOOLS.find((t) => t.slug === slug)

// Command palette + home search: one match anywhere in name/description/keywords.
export const searchTools = (q: string): Tool[] => {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  return TOOLS.filter((t) => `${t.name} ${t.desc} ${t.keywords}`.toLowerCase().includes(needle))
}
