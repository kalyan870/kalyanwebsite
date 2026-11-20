import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  auth,
  BLUEPRINT_LIMITS,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
  sanitizeSlugId,
  truncateField,
} from "../lib/firebase";
import type { ProjectItem } from "../data/kalyanData";

export interface SavedBookmark {
  id: string;
  uid: string;
  projectId: string;
  projectTitle: string;
  category: string;
  note: string;
}

export interface SavedAiSession {
  id: string;
  uid: string;
  mode: "chat" | "search" | "video";
  model: string;
  title: string;
  lastPrompt: string;
  lastResponse: string;
}

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  bookmarks: SavedBookmark[];
  aiSessions: SavedAiSession[];
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  toggleProjectBookmark: (project: ProjectItem, note?: string) => Promise<void>;
  updateBookmarkNote: (bookmarkId: string, project: ProjectItem, note: string) => Promise<void>;
  saveAiSession: (input: {
    id?: string;
    mode: "chat" | "search" | "video";
    model: string;
    title: string;
    lastPrompt: string;
    lastResponse: string;
  }) => Promise<string | null>;
  deleteAiSession: (sessionId: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [aiSessions, setAiSessions] = useState<SavedAiSession[]>([]);

  const syncUserDocuments = useCallback(async (firebaseUser: User) => {
    if (!firebaseUser.emailVerified) return;
    const uid = sanitizeSlugId(firebaseUser.uid, 128);
    const displayName = truncateField(
      firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Portfolio Visitor",
      BLUEPRINT_LIMITS.maxDisplayName
    );
    const email = truncateField(firebaseUser.email || "", BLUEPRINT_LIMITS.maxEmail);

    const userRef = doc(db, "users", uid);
    const privateRef = doc(db, "users", uid, "private", "info");

    try {
      const existingSnap = await getDoc(userRef);
      if (!existingSnap.exists()) {
        const batch = writeBatch(db);
        batch.set(userRef, {
          uid,
          displayName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        if (email.length >= 3) {
          batch.set(privateRef, {
            uid,
            email,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      } else {
        await updateDoc(userRef, {
          displayName,
          updatedAt: serverTimestamp(),
        });
        if (email.length >= 3) {
          const privateSnap = await getDoc(privateRef);
          if (!privateSnap.exists()) {
            await setDoc(privateRef, {
              uid,
              email,
              updatedAt: serverTimestamp(),
            });
          } else {
            await updateDoc(privateRef, {
              email,
              updatedAt: serverTimestamp(),
            });
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        void syncUserDocuments(nextUser).catch((err) => {
          console.error("Failed syncing user profile:", err);
        });
      } else {
        setBookmarks([]);
        setAiSessions([]);
      }
    });
    return () => unsubscribe();
  }, [syncUserDocuments]);

  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) {
      setBookmarks([]);
      setAiSessions([]);
      return;
    }

    const bookmarksPath = "bookmarks";
    const bookmarksQuery = query(collection(db, bookmarksPath), where("uid", "==", user.uid));
    const unsubBookmarks = onSnapshot(
      bookmarksQuery,
      (snapshot) => {
        const items: SavedBookmark[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            uid: String(data.uid ?? ""),
            projectId: String(data.projectId ?? ""),
            projectTitle: String(data.projectTitle ?? ""),
            category: String(data.category ?? ""),
            note: String(data.note ?? ""),
          };
        });
        setBookmarks(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, bookmarksPath);
      }
    );

    const sessionsPath = "aiSessions";
    const sessionsQuery = query(collection(db, sessionsPath), where("uid", "==", user.uid));
    const unsubSessions = onSnapshot(
      sessionsQuery,
      (snapshot) => {
        const items: SavedAiSession[] = snapshot.docs.map((d) => {
          const data = d.data();
          const modeVal = data.mode === "search" || data.mode === "video" ? data.mode : "chat";
          return {
            id: d.id,
            uid: String(data.uid ?? ""),
            mode: modeVal,
            model: String(data.model ?? "gemini-4-hydrogen"),
            title: String(data.title ?? "AI Lab Session"),
            lastPrompt: String(data.lastPrompt ?? ""),
            lastResponse: String(data.lastResponse ?? ""),
          };
        });
        setAiSessions(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, sessionsPath);
      }
    );

    return () => {
      unsubBookmarks();
      unsubSessions();
    };
  }, [authReady, user]);

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Google sign-in failed.";
      setAuthError(msg);
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Sign out failed.";
      setAuthError(msg);
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const toggleProjectBookmark = useCallback(
    async (project: ProjectItem, note = "Shortlisted from portfolio") => {
      if (!user) return;
      const docId = sanitizeSlugId(`${user.uid}_${project.id}`, 128);
      const path = `bookmarks/${docId}`;
      const existing = bookmarks.find((b) => b.projectId === project.id || b.id === docId);
      try {
        if (existing) {
          await deleteDoc(doc(db, "bookmarks", existing.id));
        } else {
          await setDoc(doc(db, "bookmarks", docId), {
            uid: user.uid,
            projectId: sanitizeSlugId(project.id, 100),
            projectTitle: truncateField(project.title, BLUEPRINT_LIMITS.maxProjectTitle) || "Project",
            category: truncateField(project.category, BLUEPRINT_LIMITS.maxCategory) || "AI",
            note: truncateField(note, BLUEPRINT_LIMITS.maxNote),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        handleFirestoreError(
          error,
          existing ? OperationType.DELETE : OperationType.CREATE,
          path
        );
      }
    },
    [bookmarks, user]
  );

  const updateBookmarkNote = useCallback(
    async (bookmarkId: string, project: ProjectItem, note: string) => {
      if (!user) return;
      const safeId = sanitizeSlugId(bookmarkId, 128);
      const path = `bookmarks/${safeId}`;
      try {
        await updateDoc(doc(db, "bookmarks", safeId), {
          projectTitle: truncateField(project.title, BLUEPRINT_LIMITS.maxProjectTitle) || "Project",
          category: truncateField(project.category, BLUEPRINT_LIMITS.maxCategory) || "AI",
          note: truncateField(note, BLUEPRINT_LIMITS.maxNote),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [user]
  );

  const saveAiSession = useCallback(
    async (input: {
      id?: string;
      mode: "chat" | "search" | "video";
      model: string;
      title: string;
      lastPrompt: string;
      lastResponse: string;
    }): Promise<string | null> => {
      if (!user) return null;
      const sessionId = sanitizeSlugId(
        input.id || `sess_${user.uid.slice(0, 8)}_${Date.now()}`,
        128
      );
      const path = `aiSessions/${sessionId}`;
      const existing = aiSessions.find((s) => s.id === sessionId);
      try {
        if (existing) {
          await updateDoc(doc(db, "aiSessions", sessionId), {
            model: truncateField(input.model, BLUEPRINT_LIMITS.maxModel) || "gemini-4-hydrogen",
            title: truncateField(input.title, BLUEPRINT_LIMITS.maxSessionTitle) || "AI Session",
            lastPrompt: truncateField(input.lastPrompt, BLUEPRINT_LIMITS.maxPrompt) || "Prompt",
            lastResponse: truncateField(input.lastResponse, BLUEPRINT_LIMITS.maxResponse),
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(doc(db, "aiSessions", sessionId), {
            uid: user.uid,
            mode: input.mode,
            model: truncateField(input.model, BLUEPRINT_LIMITS.maxModel) || "gemini-4-hydrogen",
            title: truncateField(input.title, BLUEPRINT_LIMITS.maxSessionTitle) || "AI Session",
            lastPrompt: truncateField(input.lastPrompt, BLUEPRINT_LIMITS.maxPrompt) || "Prompt",
            lastResponse: truncateField(input.lastResponse, BLUEPRINT_LIMITS.maxResponse),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        return sessionId;
      } catch (error) {
        handleFirestoreError(
          error,
          existing ? OperationType.UPDATE : OperationType.CREATE,
          path
        );
      }
    },
    [aiSessions, user]
  );

  const deleteAiSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;
      const safeId = sanitizeSlugId(sessionId, 128);
      try {
        await deleteDoc(doc(db, "aiSessions", safeId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `aiSessions/${safeId}`);
      }
    },
    [user]
  );

  const value = useMemo<FirebaseContextValue>(
    () => ({
      user,
      authReady,
      authBusy,
      authError,
      bookmarks,
      aiSessions,
      signInWithGoogle,
      signOutUser,
      toggleProjectBookmark,
      updateBookmarkNote,
      saveAiSession,
      deleteAiSession,
    }),
    [
      aiSessions,
      authBusy,
      authError,
      authReady,
      bookmarks,
      deleteAiSession,
      saveAiSession,
      signInWithGoogle,
      signOutUser,
      toggleProjectBookmark,
      updateBookmarkNote,
      user,
    ]
  );

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error("useFirebase must be used inside FirebaseProvider");
  }
  return ctx;
}
