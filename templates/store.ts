import { combineReducers, configureStore as toolkitConfigureStore } from '@reduxjs/toolkit'

// Import your slices here
// import counterSlice from './slices/counterSlice'

const rootReducer = combineReducers({
  // Add your reducers here
  // counter: counterSlice,
})

export type RootState = ReturnType<typeof rootReducer>

export function configureStore(preloadedState?: Partial<RootState>) {
  return toolkitConfigureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
  })
}

export const store = configureStore()

export type AppStore = ReturnType<typeof configureStore>
export type AppDispatch = AppStore['dispatch']
export type RootReducer = typeof rootReducer

