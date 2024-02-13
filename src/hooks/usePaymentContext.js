import { PaymentContext } from '../context/PaymentContext'
import { useContext } from 'react'

export const usePaymentContext = () => {
  const context = useContext(PaymentContext)

  if (!context) {
    throw Error('usePaymnetContext must be used inside an PaymentsContextProvider')
  }

  return context
}