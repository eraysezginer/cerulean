"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AddCompanyForm } from "@/lib/add-company-types";
import { initialAddCompanyForm } from "@/lib/add-company-types";
import { slugifyName } from "@/lib/slugify";

type StepErrors = Partial<Record<string, string>>;

type Ctx = {
  form: AddCompanyForm;
  setForm: (patch: Partial<AddCompanyForm>) => void;
  setField: <K extends keyof AddCompanyForm>(key: K, value: AddCompanyForm[K]) => void;
  stepErrors: StepErrors;
  setStepErrors: (e: StepErrors) => void;
  clearStepErrors: () => void;
  validateStep: (step: number) => boolean;
  reset: () => void;
};

const AddCompanyFormContext = createContext<Ctx | null>(null);

export function AddCompanyFormProvider({ children }: { children: ReactNode }) {
  const [form, setFormState] = useState<AddCompanyForm>(initialAddCompanyForm);
  const [stepErrors, setStepErrors] = useState<StepErrors>({});

  const setForm = useCallback((patch: Partial<AddCompanyForm>) => {
    setFormState((s) => ({ ...s, ...patch }));
  }, []);

  const setField = useCallback(
    <K extends keyof AddCompanyForm>(key: K, value: AddCompanyForm[K]) => {
      setFormState((s) => ({ ...s, [key]: value }));
    },
    []
  );

  const clearStepErrors = useCallback(() => setStepErrors({}), []);

  const reset = useCallback(() => {
    setFormState(initialAddCompanyForm);
    setStepErrors({});
  }, []);

  useEffect(() => {
    const base = form.legalName.trim() || form.brandName.trim();
    const addr = base
      ? `${slugifyName(base)}@updates.cerulean.ai`
      : "company@updates.cerulean.ai";
    setFormState((s) =>
      s.forwardingAddress === addr ? s : { ...s, forwardingAddress: addr }
    );
  }, [form.legalName, form.brandName]);

  const validateStep = useCallback(
    (step: number): boolean => {
      const err: StepErrors = {};
      if (step === 1) {
        if (!form.legalName.trim()) {
          err.legalName = "Legal company name is required.";
        }
      }
      if (step === 2) {
        if (!form.fundId) {
          err.fundId = "Select a fund or create one.";
        } else if (form.fundId === "__new__") {
          if (!form.newFundName.trim()) {
            err.newFundName = "Enter a name for the new fund.";
          } else {
            err.fundId = "Save the new fund to continue.";
          }
        }
        if (!form.investmentDate.trim()) {
          err.investmentDate = "Investment date is required.";
        }
        if (!form.checkSize.trim()) {
          err.checkSize = "Your check size is required.";
        }
      }
      if (step === 3) {
        const hasFiles = form.historicalFileMeta.length > 0;
        const hasEmails = form.founderEmails.trim().length > 0;
        if (!hasFiles && !hasEmails) {
          err.ingestion =
            "Add at least one founder email or upload a historical file.";
        }
      }
      setStepErrors(err);
      return Object.keys(err).length === 0;
    },
    [form]
  );

  const value = useMemo(
    () => ({
      form,
      setForm,
      setField,
      stepErrors,
      setStepErrors,
      clearStepErrors,
      validateStep,
      reset,
    }),
    [form, setForm, setField, stepErrors, validateStep, reset, clearStepErrors]
  );

  return (
    <AddCompanyFormContext.Provider value={value}>
      {children}
    </AddCompanyFormContext.Provider>
  );
}

export function useAddCompany() {
  const ctx = useContext(AddCompanyFormContext);
  if (!ctx) {
    throw new Error("useAddCompany must be used under AddCompanyFormProvider");
  }
  return ctx;
}
