import { AttendanceContext } from '../context/AttendanceContext'
import { useContext } from 'react'

export const useAttendanceContext = () => {
  const context = useContext(AttendanceContext)

  if (!context) {
    throw Error('useAttendanceContext must be used inside an AttendanceContextProvider')
  }

  return context
}