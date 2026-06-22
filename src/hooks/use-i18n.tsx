import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  TRANSLATIONS_FR,
  TRANSLATIONS_EN,
  SERVICE_TRANSLATIONS_EN,
  CATEGORY_TRANSLATIONS_EN,
  type TranslationDictionary,
} from "@/lib/i18n/translations";
import type { CategoryInfo } from "@/lib/service-categories";

export type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationDictionary, vars?: Record<string, string | number>) => string;
  translateService: <
    T extends {
      id: string;
      name: string;
      description?: string | null;
      best_for?: string | null;
      category: string;
    },
  >(
    service: T,
  ) => T;
  translateCategory: (category: CategoryInfo) => CategoryInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    const stored = localStorage.getItem("nailhouse-lang");
    if (stored === "fr" || stored === "en") {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("nailhouse-lang", lang);
    // Optionally update document language attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  };

  const t = (key: keyof TranslationDictionary, vars?: Record<string, string | number>): string => {
    const dict = language === "en" ? TRANSLATIONS_EN : TRANSLATIONS_FR;
    let text = dict[key] || TRANSLATIONS_FR[key] || String(key);
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  // Translate a database/JSON service object.
  // Supports direct properties name_en / description_en / best_for_en / category_en from backend,
  // falling back to local mapping, then original French fields.
  const translateService = <
    T extends {
      id: string;
      name: string;
      description?: string | null;
      best_for?: string | null;
      category: string;
    },
  >(
    service: T,
  ): T => {
    if (language === "fr") return service;

    const serviceRecord = service as Record<string, unknown>;
    const name =
      (serviceRecord.name_en as string) ||
      SERVICE_TRANSLATIONS_EN[service.id]?.name ||
      service.name;
    const description =
      (serviceRecord.description_en as string) ||
      SERVICE_TRANSLATIONS_EN[service.id]?.description ||
      service.description;
    const best_for =
      (serviceRecord.best_for_en as string) ||
      SERVICE_TRANSLATIONS_EN[service.id]?.best_for ||
      service.best_for;

    // Localized category title lookup
    let category = (serviceRecord.category_en as string) || service.category;
    if (category === "Soins des mains") category = "Hand Care";
    else if (category === "Soins des pieds") category = "Foot Care";
    else if (category === "Ongles naturels renforcés") category = "Reinforced Natural Nails";
    else if (category === "Ongle naturel BIAB") category = "Natural Nail BIAB";
    else if (category === "Capsule sur ongle") category = "Tips & Extensions";
    else if (category === "Supplément") category = "Add-ons & Nail Art";
    else if (category === "Dépose") category = "Removal in Salon";

    return {
      ...service,
      name,
      description,
      best_for,
      category,
    };
  };

  // Translate static or dynamic category information.
  const translateCategory = (c: CategoryInfo): CategoryInfo => {
    if (language === "fr") return c;

    const localTrans = CATEGORY_TRANSLATIONS_EN[c.slug];
    if (!localTrans) return c;

    return {
      ...c,
      title: localTrans.title,
      category: localTrans.category,
      tagline: localTrans.tagline,
      intro: localTrans.intro,
      bestFor: localTrans.bestFor,
      highlights: localTrans.highlights,
      care: localTrans.care,
      steps: localTrans.steps,
      whyUs: localTrans.whyUs,
      faq: localTrans.faq,
    };
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, translateService, translateCategory }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used within a LanguageProvider");
  }
  return context;
}
