import { createContext, useReducer } from 'react'

export const TuteContext = createContext()

export const tuteReducer = (state, action) => {

  switch (action.type) {
    case 'CREATE_TUTE':
      return {
        tutes: [action.payload, ...state.tutes]
      }
    case 'SET_TUTE': 
      return {
        tutes: action.payload
      }
    case 'DELETE_TUTE':
      return {
        tutes: state.tutes.filter((w) => w._id !== action.payload._id)
      }
    default:
      return state
  }
}

export const TuteContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tuteReducer, {
    tutes:[]
  })

  return (
    <TuteContext.Provider value={{...state, dispatch}}>
      { children }
    </TuteContext.Provider>
  )
}