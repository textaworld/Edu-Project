import { TuteContext } from '../context/TuteContext'
import { useContext } from 'react'

export const useTuteContext = () => {
  const context = useContext(TuteContext)

  if (!context) {
    throw Error('useTuteContext must be used inside an TuteContextProvider')
  }

  return context
}