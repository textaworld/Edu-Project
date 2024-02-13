import { createContext, useReducer } from 'react'

export const AdminContext = createContext()

export const adminReducer = (state, action) => {

  switch (action.type) {
    case 'CREATE_ADMIN':
      return {
        admins: [action.payload, ...state.admins]
      }
    case 'SET_ADMINS': 
      return {
        admins: action.payload
      }
    case 'DELETE_ADMIN':
      return {
        admins: state.admins.filter((w) => w._id !== action.payload)
      }
    default:
      return state
  }
}

export const AdminContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, {
    admins: []
  })

  return (
    <AdminContext.Provider value={{...state, dispatch}}>
      { children }
    </AdminContext.Provider>
  )
}