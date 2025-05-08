import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { User, Reclamation } from "@/lib/types";

export const getUsers = async (): Promise<User[]> => {
  try {
    const usersCol = collection(db, "users");
    const userSnapshot = await getDocs(usersCol);
    
    return userSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nom: data.nom || "",
        email: data.email || "",
        telephone: data.telephone || "",
        localisation: data.localisation || "",
        dateJoined: data.dateJoined?.toDate() || new Date(),
        isBlocked: data.isBlocked || false
      };
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const userDoc = doc(db, "users", id);
    const userSnapshot = await getDoc(userDoc);
    
    if (!userSnapshot.exists()) {
      return null;
    }
    
    const data = userSnapshot.data();
    return {
      id: userSnapshot.id,
      nom: data.nom || "",
      email: data.email || "",
      telephone: data.telephone || "",
      localisation: data.localisation || "",
      dateJoined: data.dateJoined?.toDate() || new Date(),
      isBlocked: data.isBlocked || false
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const createUser = async (userData: Omit<User, "id" | "dateJoined" | "isBlocked">, password: string): Promise<string> => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
    
    // Create user document in Firestore
    const userDoc = doc(db, "users", userCredential.user.uid);
    await updateDoc(userDoc, {
      ...userData,
      dateJoined: serverTimestamp(),
      isBlocked: false,
      createdAt: serverTimestamp()
    });

    return userCredential.user.uid;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<void> => {
  try {
    const userDoc = doc(db, "users", id);
    await updateDoc(userDoc, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    const userDoc = doc(db, "users", id);
    await deleteDoc(userDoc);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const toggleUserBlock = async (id: string, isBlocked: boolean): Promise<void> => {
  try {
    const userDoc = doc(db, "users", id);
    await updateDoc(userDoc, {
      isBlocked: isBlocked,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error toggling user block status:", error);
    throw error;
  }
};

export const getUserReclamations = async (userId: string): Promise<Reclamation[]> => {
  try {
    const reclamationsCol = collection(db, `users/${userId}/reclamations`);
    const reclamationsSnapshot = await getDocs(reclamationsCol);
    
    return reclamationsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        expediteur: data.expediteur || "",
        recepteur: data.recepteur || "",
        message: data.message || "",
        date: data.date?.toDate() || new Date(),
        resolved: data.resolved || false,
        userId: userId
      };
    });
  } catch (error) {
    console.error("Error fetching user reclamations:", error);
    throw error;
  }
};

export const getUsersCount = async (): Promise<number> => {
  try {
    const usersCol = collection(db, "users");
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.size;
  } catch (error) {
    console.error("Error fetching users count:", error);
    throw error;
  }
};

export const getUsersOverTime = async (): Promise<{ date: string; value: number }[]> => {
  try {
    const usersCol = collection(db, "users");
    const userSnapshot = await getDocs(query(usersCol, orderBy("dateJoined", "asc")));
    
    const usersByDate: { [key: string]: number } = {};
    let runningTotal = 0;
    
    userSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.dateJoined) {
        const date = new Date(data.dateJoined.toDate()).toISOString().split("T")[0];
        runningTotal += 1;
        usersByDate[date] = runningTotal;
      }
    });
    
    return Object.entries(usersByDate).map(([date, value]) => ({ date, value }));
  } catch (error) {
    console.error("Error fetching users over time:", error);
    throw error;
  }
};