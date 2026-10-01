import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BookItem, UserProfile } from '../types';

// 1. Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. Strict Error Handling Enum and Function
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection on Startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration or network connection.');
    }
  }
}
testConnection();

// 4. Authentication Functions
export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    if (!user) return null;

    // Check or create user document in Firestore
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    const isAdminEmail = user.email === 'linhtetitservice@gmail.com';
    const nowIso = new Date().toISOString();

    let profile: UserProfile;
    const nameStr = user.displayName || 'Al-Hikmah Member';
    const initials = nameStr
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AH';

    if (snap.exists()) {
      const data = snap.data();
      profile = {
        id: user.uid,
        uid: user.uid,
        name: data.displayName || nameStr,
        displayName: data.displayName || nameStr,
        email: user.email || '',
        photoURL: data.photoURL || user.photoURL || undefined,
        role: isAdminEmail ? 'admin' : (data.role || 'student'),
        avatarInitials: initials,
        joinDate: data.createdAt ? new Date(data.createdAt).getFullYear().toString() + ' ခုနှစ်' : '၂၀၂၆ ခုနှစ်',
        isPremium: isAdminEmail ? true : (data.isPremium ?? false),
        savedBookmarks: data.savedBookmarks || [],
        readingHistory: data.readingHistory || [],
        notes: data.notes || [],
        bookmarks: data.bookmarks || [],
        personalNotes: data.personalNotes || [],
      };
      // Update last active
      await updateDoc(userRef, {
        updatedAt: nowIso,
        role: profile.role,
        isPremium: profile.isPremium,
      });
    } else {
      profile = {
        id: user.uid,
        uid: user.uid,
        name: nameStr,
        displayName: nameStr,
        email: user.email || '',
        photoURL: user.photoURL || undefined,
        role: isAdminEmail ? 'admin' : 'student',
        avatarInitials: initials,
        joinDate: '၂၀၂၆ ခုနှစ်',
        isPremium: isAdminEmail ? true : false,
        savedBookmarks: [],
        readingHistory: [],
        notes: [],
        bookmarks: [],
        personalNotes: [],
      };
      await setDoc(userRef, {
        uid: profile.uid,
        displayName: profile.displayName,
        email: profile.email,
        photoURL: profile.photoURL || '',
        role: profile.role,
        isPremium: profile.isPremium,
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    return profile;
  } catch (err) {
    console.error('Sign-in error:', err);
    throw err;
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// 5. User Profile Synchronization
export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const isAdminEmail = user.email === 'linhtetitservice@gmail.com';
    const nameStr = user.displayName || 'Member';
    const initials = nameStr
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'M';

    if (snap.exists()) {
      const data = snap.data();
      return {
        id: user.uid,
        uid: user.uid,
        name: data.displayName || nameStr,
        displayName: data.displayName || nameStr,
        email: user.email || '',
        photoURL: data.photoURL || user.photoURL || undefined,
        role: isAdminEmail ? 'admin' : (data.role || 'student'),
        avatarInitials: initials,
        joinDate: data.createdAt ? new Date(data.createdAt).getFullYear().toString() + ' ခုနှစ်' : '၂၀၂၆ ခုနှစ်',
        isPremium: isAdminEmail ? true : (data.isPremium ?? false),
        savedBookmarks: data.savedBookmarks || [],
        readingHistory: data.readingHistory || [],
        notes: data.notes || [],
        bookmarks: data.bookmarks || [],
        personalNotes: data.personalNotes || [],
      };
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
    return null;
  }
}

export async function saveUserProgressToFirestore(
  userId: string,
  readingHistory: UserProfile['readingHistory'],
  savedBookmarks: string[],
  notes: UserProfile['notes']
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        readingHistory: readingHistory || [],
        savedBookmarks: savedBookmarks || [],
        notes: notes || [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
  }
}

// 6. Community Books Synchronization
export function subscribeToBooks(onBooksReceived: (books: BookItem[]) => void) {
  const booksCol = collection(db, 'books');
  const q = query(booksCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const liveBooks: BookItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        liveBooks.push({
          id: docSnap.id,
          titleMm: data.titleMm,
          titleAr: data.titleAr,
          titleEn: data.titleEn,
          authorMm: data.authorMm,
          authorAr: data.authorAr,
          category: data.category,
          categoryMm: data.categoryMm,
          descriptionMm: data.descriptionMm,
          coverColor: data.coverColor || 'from-emerald-950 to-stone-900',
          totalPages: data.totalPages || 1,
          isMemberOnly: data.isMemberOnly ?? false,
          language: data.language || 'my',
          publishedYear: data.publishedYear,
          readCount: data.readCount || 0,
          rating: data.rating || 5.0,
          isUserUploaded: data.isUserUploaded ?? false,
          fileData: data.fileData,
          chapters: data.chapters || [],
          telegramChannel: data.telegramChannel,
          telegramPostId: data.telegramPostId,
        });
      });
      onBooksReceived(liveBooks);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'books');
    }
  );
}

export async function saveBookToFirestore(book: BookItem, uploaderUid: string, uploaderName: string): Promise<void> {
  const path = `books/${book.id}`;
  try {
    const bookRef = doc(db, 'books', book.id);
    await setDoc(bookRef, {
      id: book.id,
      titleMm: book.titleMm,
      titleAr: book.titleAr || '',
      titleEn: book.titleEn || '',
      authorMm: book.authorMm,
      authorAr: book.authorAr || '',
      category: book.category,
      categoryMm: book.categoryMm || '',
      descriptionMm: book.descriptionMm || '',
      coverColor: book.coverColor,
      totalPages: book.totalPages,
      isMemberOnly: book.isMemberOnly,
      language: book.language || 'my',
      publishedYear: book.publishedYear || new Date().getFullYear().toString(),
      readCount: book.readCount || 0,
      rating: book.rating || 5.0,
      isUserUploaded: true,
      uploaderId: uploaderUid,
      uploaderName: uploaderName,
      fileData: book.fileData || '',
      telegramChannel: book.telegramChannel || '',
      telegramPostId: book.telegramPostId ? String(book.telegramPostId) : '',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// 7. Fatwa Community Questions
export interface FatwaDoc {
  id: string;
  questionMm: string;
  category: string;
  authorName: string;
  authorEmail?: string;
  authorUid?: string;
  status: 'pending' | 'answered' | 'archived';
  answerMm?: string;
  answeredBy?: string;
  references?: string;
  createdAt: string;
  answeredAt?: string;
}

export function subscribeToFatwas(onFatwasReceived: (fatwas: FatwaDoc[]) => void) {
  const fatwaCol = collection(db, 'fatwaQuestions');
  const q = query(fatwaCol, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: FatwaDoc[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...(d.data() as any) });
      });
      onFatwasReceived(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'fatwaQuestions');
    }
  );
}

export async function submitFatwaQuestionToFirestore(
  questionMm: string,
  category: string,
  authorName: string,
  authorEmail?: string,
  authorUid?: string
): Promise<string> {
  const id = `fatwa-${Date.now()}`;
  const path = `fatwaQuestions/${id}`;
  try {
    const docRef = doc(db, 'fatwaQuestions', id);
    await setDoc(docRef, {
      id,
      questionMm,
      category,
      authorName,
      authorEmail: authorEmail || '',
      authorUid: authorUid || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    return id;
  }
}
