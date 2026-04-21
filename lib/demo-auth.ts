/** Demo ortamı — gerçek auth değil; sadece sabit kullanıcı kontrolü */
export const DEMO_EMAIL = "admin@demo.com";
export const DEMO_PASSWORD = "123456";

/** localStorage anahtarı — sadece demo oturumu için */
export const DEMO_SESSION_EMAIL_KEY = "cerulean.demo.email";

export function isDemoLoginValid(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEMO_EMAIL &&
    password === DEMO_PASSWORD
  );
}

export function setDemoSession(email: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_SESSION_EMAIL_KEY, email.trim().toLowerCase());
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_SESSION_EMAIL_KEY);
}

export function getDemoSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(DEMO_SESSION_EMAIL_KEY);
  return v && v.length > 0 ? v : null;
}
