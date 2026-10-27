import { PRIVATE_PATHS } from "@/lib/site";

const KEY = "posygo.signed-in";

export function rememberSignedIn(signedIn: boolean): void {
  try {
    if (signedIn) {
      window.localStorage.setItem(KEY, "1");
    } else {
      window.localStorage.removeItem(KEY);
    }
  } catch {
    return;
  }
}

function hasSignedInBefore(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATHS.some((prefix) => !prefix.includes("*") && (pathname === prefix || pathname.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`)));
}

export function shouldRestoreSession(pathname: string): boolean {
  return isPrivatePath(pathname) || hasSignedInBefore();
}
