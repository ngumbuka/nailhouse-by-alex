import { useState, useEffect } from "react";

const STORAGE_KEY = "nailhouse-service-selection";
const CUSTOM_EVENT_NAME = "nailhouse-selection-change";

export function useServiceSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSelectedIds(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored service selection", e);
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSelectedIds(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    const handleCustomChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      setSelectedIds(stored ? JSON.parse(stored) : []);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CUSTOM_EVENT_NAME, handleCustomChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CUSTOM_EVENT_NAME, handleCustomChange);
    };
  }, []);

  const saveSelection = (ids: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    setSelectedIds(ids);
    window.dispatchEvent(new Event(CUSTOM_EVENT_NAME));
  };

  const addService = (id: string) => {
    if (!selectedIds.includes(id)) {
      const next = [...selectedIds, id];
      saveSelection(next);
    }
  };

  const removeService = (id: string) => {
    const next = selectedIds.filter((item) => item !== id);
    saveSelection(next);
  };

  const clearSelection = () => {
    saveSelection([]);
  };

  const isSelected = (id: string) => {
    return selectedIds.includes(id);
  };

  return {
    selectedIds: isMounted ? selectedIds : [],
    addService,
    removeService,
    clearSelection,
    isSelected,
    isReady: isMounted,
  };
}
