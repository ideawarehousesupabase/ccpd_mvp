import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";

export type SessionUser = {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  email: string;
};

const USERS = "users";
const SESSIONS = "sessions";
const SESSION_COOKIE = "ccpd_session_id";

export type RegisterInput = {
  name: string;
  businessName: string;
  industry?: string;
  email: string;
  password: string;
};

// All persistence (users, sessions, app state) is backed by Firestore.
export async function registerUser(input: RegisterInput): Promise<SessionUser> {
  return registerUserFirebase(input);
}

export async function loginUser(email: string, password: string): Promise<SessionUser> {
  return loginUserFirebase(email, password);
}

export async function registerUserFirebase(input: RegisterInput): Promise<SessionUser> {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const existing = await getDocs(
    query(collection(db, USERS), where("email", "==", email), limit(1)),
  );
  if (!existing.empty) {
    throw new Error("An account with this email already exists.");
  }
  const ref = await addDoc(collection(db, USERS), {
    name: input.name.trim(),
    businessName: input.businessName.trim(),
    industry: input.industry ?? "",
    email,
    password: input.password,
    createdAt: new Date().toISOString(),
  });

  return {
    id: ref.id,
    name: input.name.trim(),
    businessName: input.businessName.trim(),
    industry: input.industry ?? "",
    email,
  };
}

/** Verifies the current password for an email and stores a new one. */
export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const db = getDb();
  const snap = await getDocs(
    query(
      collection(db, USERS),
      where("email", "==", email.trim().toLowerCase()),
      limit(1),
    ),
  );
  const found = snap.docs[0];
  if (!found) throw new Error("No account found for that email.");
  const data = found.data() as Record<string, string>;
  if (data['password'] !== currentPassword) {
    throw new Error("Your current password is incorrect.");
  }
  await updateDoc(doc(db, USERS, found.id), { password: newPassword });
}

export async function loginUserFirebase(
  email: string,
  password: string,
): Promise<SessionUser> {
  const db = getDb();
  const snap = await getDocs(
    query(
      collection(db, USERS),
      where("email", "==", email.trim().toLowerCase()),
      limit(1),
    ),
  );
  const doc = snap.docs[0];
  if (!doc) throw new Error("Invalid credentials.");
  const data = doc.data() as Record<string, string>;
  if (data['password'] !== password) throw new Error("Invalid credentials.");
  return {
    id: doc.id,
    name: data['name'] ?? "",
    businessName: data['businessName'] ?? "",
    industry: data['industry'] ?? "",
    email: data['email'] ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Sessions: stored in Firestore, referenced by a session-id cookie.   */
/* ------------------------------------------------------------------ */

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function getSessionId(): string | null {
  return readCookie(SESSION_COOKIE);
}

export async function saveSession(user: SessionUser) {
  const db = getDb();
  const sessionId = crypto.randomUUID();
  await setDoc(doc(db, SESSIONS, sessionId), {
    userId: user.id,
    name: user.name,
    businessName: user.businessName,
    industry: user.industry,
    email: user.email,
    createdAt: serverTimestamp(),
  });
  writeCookie(SESSION_COOKIE, sessionId, 60 * 60 * 24 * 7);
  window.dispatchEvent(new Event("ccpd-session"));
}

export async function readSession(): Promise<SessionUser | null> {
  const sessionId = getSessionId();
  if (!sessionId) return null;
  try {
    const snap = await getDoc(doc(getDb(), SESSIONS, sessionId));
    if (!snap.exists()) return null;
    const data = snap.data() as Record<string, string>;
    return {
      id: data['userId'] ?? "",
      name: data['name'] ?? "",
      businessName: data['businessName'] ?? "",
      industry: data['industry'] ?? "",
      email: data['email'] ?? "",
    };
  } catch {
    return null;
  }
}

export function clearSession() {
  const sessionId = getSessionId();
  writeCookie(SESSION_COOKIE, "", 0);
  window.dispatchEvent(new Event("ccpd-session"));
  if (sessionId) {
    void deleteDoc(doc(getDb(), SESSIONS, sessionId)).catch(() => undefined);
  }
}

export const INDUSTRIES = [
  "Restaurant & Food Delivery",
  "E-commerce & Retail",
  "Logistics & Courier",
  "Hospitality",
  "Consumer Packaged Goods",
  "Telecom & Services",
];