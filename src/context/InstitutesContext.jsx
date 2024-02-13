import { createContext, useReducer } from 'react';

export const InstitutesContext = createContext();

export const institutesReducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_INSTITUE':
      return {
        institutes: [action.payload, ...state.institutes]
      };
    case 'SET_INSTITUES':
      return {
        institutes: action.payload
      };
    case 'DELETE_INSTITUE':
      return {
        institutes: state.institutes.filter((w) => w._id !== action.payload)
      };
      case 'UPDATE_INSTITUTE':
        return {
          institutes: state.institutes.map((inst) =>
            inst._id === action.payload._id
              ? { ...inst, ...action.payload.data }
              : inst
          )
        };
    default:
      return state;
  }
};

export const InstitutesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(institutesReducer, {
    institutes: []
  });

  return (
    <InstitutesContext.Provider value={{ ...state, dispatch }}>
      {children}
    </InstitutesContext.Provider>
  );
};
