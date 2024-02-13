import { createContext, useReducer } from "react";

export const SiteDetailsContext = createContext();

export const siteDetailsReducer = (state, action) => {
  switch (action.type) {
    case "SET_SITE_DETAILS":
      return {
        sitedetail: action.payload,
      };

    default:
      return state;
  }
};

export const SiteDetailsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(siteDetailsReducer, {
    sitedetail: [],
  });

  return (
    <SiteDetailsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </SiteDetailsContext.Provider>
  );
};
