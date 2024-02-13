import { InstitutesContext } from '../context/InstitutesContext'
import { useContext } from 'react'

export const useInstitutesContext = () => {
  const context = useContext(InstitutesContext)

  if (!context) {
    throw Error('useInstitutesContext must be used inside an InstitutesContextProvider')
  }

  return context
}