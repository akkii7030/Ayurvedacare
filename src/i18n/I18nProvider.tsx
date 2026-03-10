import { createContext, useContext, useState, type ReactNode } from "react";
import { messages, type Locale } from "./messages";

type I18nContextValue = {
  lang: Locale;
  setLang: (lang: Locale) => void;
  toggleLang: () => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "spc_lang";

function getInitialLang(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === "hi" ? "hi" : "en";
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Locale>(getInitialLang);

  const setLang = (nextLang: Locale) => {
    setLangState(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, nextLang);
    }
  };

  const toggleLang = () => setLang(lang === "en" ? "hi" : "en");

  const t = (key: string) => messages[lang][key] || messages.en[key] || key;

  const value = { lang, setLang, toggleLang, t };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return ctx;
};
