"use client";

import { useEffect, useState } from "react";
import { companies } from "@/data/companies";
import { getDefaultCompanyId } from "@/lib/default-company";

export function useDefaultCompanyId() {
  const [id, setId] = useState<string>(companies[0].id);

  useEffect(() => {
    setId(getDefaultCompanyId());
    function sync() {
      setId(getDefaultCompanyId());
    }
    window.addEventListener("cerulean-default-company", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cerulean-default-company", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return id;
}
