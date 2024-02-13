import { createContext, useReducer } from 'react'

export const EmailContext = createContext()

export const emailReducer = (state, action) => {

  switch (action.type) {
    case 'CREATE_EMAIL':
      return {
        emails: [action.payload, ...state.emails]
      }
    case 'SET_EMAILS': 
      return {
        emails: action.payload
      }
    case 'DELETE_EMAIL':
      return {
        emails: state.emails.filter((w) => w._id !== action.payload._id)
      }
    default:
      return state
  }
}

export const EmailContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(emailReducer, {
    emails:[]
  })

  return (
    <EmailContext.Provider value={{...state, dispatch}}>
      { children }
    </EmailContext.Provider>
  )
}