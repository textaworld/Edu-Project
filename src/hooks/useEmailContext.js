import { EmailContext } from '../context/EmailContext'
import { useContext } from 'react'

export const useEmailContext = () => {
  const context = useContext(EmailContext)

  if (!context) {
    throw Error('useEmailContext must be used inside an EmailContextProvider')
  }

  return context
}