import { SiteDetailsContext } from '../context/SiteDetailsContext'
import { useContext } from 'react'

export const useSiteDetailsContext = () => {
  const context = useContext(SiteDetailsContext)

  if (!context) {
    throw Error('useSiteDetailsContext must be used inside an SiteDetailsContextProvider')
  }

  return context
}