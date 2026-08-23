import { createSlice } from '@reduxjs/toolkit'

interface UiState {
  theme: 'verdant' | 'dark'
}

const initialState: UiState = { theme: 'dark' }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'verdant' ? 'dark' : 'verdant'
    },
  },
})

export const { toggleTheme } = uiSlice.actions
export default uiSlice.reducer
