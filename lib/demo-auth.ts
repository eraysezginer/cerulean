/** Demo ortamı — gerçek auth değil; sadece sabit kullanıcı kontrolü */
export const DEMO_EMAIL = "admin@demo.com";
export const DEMO_PASSWORD = "123456";

export function isDemoLoginValid(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === DEMO_EMAIL &&
    password === DEMO_PASSWORD
  );
}
