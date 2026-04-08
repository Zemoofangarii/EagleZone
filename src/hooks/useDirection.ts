import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const RTL_LANGUAGES = ["ar"];

export function useDirection() {
  const { i18n } = useTranslation();
  const isRtl = RTL_LANGUAGES.includes(i18n.language);
  const dir = isRtl ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", i18n.language);
  }, [i18n.language, dir]);

  return { dir, isRtl, language: i18n.language };
}
