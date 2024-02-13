import { createContext, useReducer } from 'react'

export const AttendanceContext = createContext()

export const attendanceReducer = (state, action) => {

  switch (action.type) {
    case 'CREATE_ATTENDANCE':
      return {
        attendances: [action.payload, ...state.attendances]
      }
    case 'SET_ATTENDANCE': 
      return {
        attendances: action.payload
      }
    case 'DELETE_ATTENDANCE':
      return {
        attendances: state.attendances.filter((w) => w._id !== action.payload._id)
      }
    default:
      return state
  }
}

export const AttendanceContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(attendanceReducer, {
    attendances:[]
  })

  return (
    <AttendanceContext.Provider value={{...state, dispatch}}>
      { children }
    </AttendanceContext.Provider>
  )
}