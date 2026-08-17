import { configureStore } from '@reduxjs/toolkit'
import calculatorReducer from './calculatorSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    calculator: calculatorReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
