import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SavedScenario } from '../types/calculator'

interface CalculatorState {
  scenarios: SavedScenario[]
  handoff: { targetSlug: string; inputs: Record<string, number> } | null
}

const initialState: CalculatorState = { scenarios: [], handoff: null }

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    saveScenario(state, action: PayloadAction<SavedScenario>) {
      state.scenarios.push(action.payload)
    },
    removeScenario(state, action: PayloadAction<string>) {
      state.scenarios = state.scenarios.filter((item) => item.id !== action.payload)
    },
    clearCalculatorScenarios(state, action: PayloadAction<string>) {
      state.scenarios = state.scenarios.filter((item) => item.calculatorSlug !== action.payload)
    },
    setHandoff(state, action: PayloadAction<CalculatorState['handoff']>) {
      state.handoff = action.payload
    },
    consumeHandoff(state) {
      state.handoff = null
    },
  },
})

export const { saveScenario, removeScenario, clearCalculatorScenarios, setHandoff, consumeHandoff } = calculatorSlice.actions
export default calculatorSlice.reducer
