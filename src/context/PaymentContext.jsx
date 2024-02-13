import { createContext, useReducer } from 'react'

export const PaymentContext = createContext()

export const paymentsReducer = (state, action) => {

  switch (action.type) {
    case 'CREATE_PAYMENT':
      return {
        payments: [action.payload, ...state.payments]
      }
    case 'SET_PAYMENT': 
      return {
        payments: action.payload
      }
    case 'DELETE_PAYMENT':
      return {
        payments: state.payments.filter((w) => w._id !== action.payload._id)
      }
    default:
      return state
  }
}

export const PaymentsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentsReducer, {
    payments:[]
  })

  return (
    <PaymentContext.Provider value={{...state, dispatch}}>
      { children }
    </PaymentContext.Provider>
  )
}