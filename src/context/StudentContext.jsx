import { createContext, useReducer } from 'react'

export const StudentContext = createContext()

export const studentReducer = (state, action) => {

  switch (action.type) {
    case 'CREATE_STUDENT':
      return {
        students: [action.payload, ...state.students]
      }
    case 'SET_STUDENTS': 
      return {
        students: action.payload
      }
    case 'DELETE_STUDENT':
      return {
        students: state.students.filter(student => student._id !== action.payload),
      }
    default:
      return state
  }
}

export const StudentContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(studentReducer, {
    students:[]
  })

  return (
    <StudentContext.Provider value={{...state, dispatch}}>
      { children }
    </StudentContext.Provider>
  )
}