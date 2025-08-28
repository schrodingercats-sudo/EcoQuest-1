import { 
  signInWithRedirect, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User, UserRole } from "@shared/schema";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithRedirect(auth, provider);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await createOrUpdateUser(result.user, "student"); // Default to student role
      return result.user;
    }
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

export const createOrUpdateUser = async (firebaseUser: FirebaseUser, role: UserRole = "student") => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: Omit<User, "id"> = {
      email: firebaseUser.email || "",
      name: firebaseUser.displayName || "",
      role,
      totalPoints: 0,
      badges: [],
      level: 1,
      createdAt: new Date(),
      lastActive: new Date()
    };

    await setDoc(userRef, userData);
  } else {
    // Update last active
    await setDoc(userRef, { lastActive: new Date() }, { merge: true });
  }
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
