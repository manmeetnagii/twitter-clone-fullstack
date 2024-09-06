import { createContext } from "react";

const deafultValue = {
    locale: "en",
    setLocale: () => {}
}

export default createContext(deafultValue);