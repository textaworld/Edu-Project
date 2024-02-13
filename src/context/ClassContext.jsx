import { createContext, useReducer } from 'react'

export const ClassContext = createContext()

export const classReducer = (state, action) => {

  switch (action.type) {
    case 'CREATE_CLASS':
      return {
        classs: [action.payload, ...state.classs]
      }
    case 'SET_CLASS': 
      return {
        classs: action.payload
      }
    case 'DELETE_CLASS':
      return {
        classs: state.classs.filter((w) => w._id !== action.payload)
        //classs: state.classs.filter(classs => classs._id !== action.payload),

      }
    default:
      return state
  }
}

export const ClassContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(classReducer, {
    classs:[]
  })

  return (
    <ClassContext.Provider value={{...state, dispatch}}>
      { children }
    </ClassContext.Provider>
  )
}