import { ClassContext } from '../context/ClassContext'
import { useContext } from 'react'

export const useClassContext = () => {
  const context = useContext(ClassContext)

  if (!context) {
    throw Error('useClassContext must be used inside an ClassContextProvider')
  }

  return context
}