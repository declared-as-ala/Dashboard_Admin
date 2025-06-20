import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Reclamation } from "@/lib/types";

export const getAllReclamations = async (): Promise<Reclamation[]> => {
  try {
    const users = await getDocs(collection(db, "users"));
    let allReclamations: Reclamation[] = [];
    
    for (const userDoc of users.docs) {
      const userId = userDoc.id;
      const reclamationsCollection = collection(db, `users/${userId}/reclamations`);
      const reclamationsSnapshot = await getDocs(reclamationsCollection);
      
      const userReclamations = reclamationsSnapshot.docs.map(doc => {
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
      
      allReclamations = [...allReclamations, ...userReclamations];
    }
    
    // Sort by date (newest first)
    return allReclamations.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error) {
    console.error("Error fetching all reclamations:", error);
    throw error;
  }
};

export const updateReclamation = async (
  userId: string, 
  reclamationId: string, 
  data: Partial<Reclamation>
): Promise<void> => {
  try {
    const reclamationDoc = doc(db, `users/${userId}/reclamations`, reclamationId);
    await updateDoc(reclamationDoc, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating reclamation:", error);
    throw error;
  }
};

export const markReclamationResolved = async (
  userId: string, 
  reclamationId: string, 
  resolved: boolean
): Promise<void> => {
  try {
    const reclamationDoc = doc(db, `users/${userId}/reclamations`, reclamationId);
    await updateDoc(reclamationDoc, {
      resolved: resolved,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error marking reclamation as resolved:", error);
    throw error;
  }
};

export const deleteReclamation = async (
  userId: string, 
  reclamationId: string
): Promise<void> => {
  try {
    const reclamationDoc = doc(db, `users/${userId}/reclamations`, reclamationId);
    await deleteDoc(reclamationDoc);
  } catch (error) {
    console.error("Error deleting reclamation:", error);
    throw error;
  }
};

export const getReclamationsCount = async (): Promise<number> => {
  try {
    const users = await getDocs(collection(db, "users"));
    let totalCount = 0;
    
    for (const userDoc of users.docs) {
      const userId = userDoc.id;
      const reclamationsCollection = collection(db, `users/${userId}/reclamations`);
      const reclamationsSnapshot = await getDocs(reclamationsCollection);
      totalCount += reclamationsSnapshot.size;
    }
    
    return totalCount;
  } catch (error) {
    console.error("Error fetching reclamations count:", error);
    throw error;
  }
};

export const getReclamationsOverTime = async (): Promise<{ date: string; value: number }[]> => {
  try {
    const users = await getDocs(collection(db, "users"));
    const reclamationsByDate: { [key: string]: number } = {};
    
    for (const userDoc of users.docs) {
      const userId = userDoc.id;
      const reclamationsCollection = collection(db, `users/${userId}/reclamations`);
      const reclamationsSnapshot = await getDocs(query(reclamationsCollection, orderBy("date", "asc")));
      
      reclamationsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.date) {
          const date = new Date(data.date.toDate()).toISOString().split("T")[0];
          reclamationsByDate[date] = (reclamationsByDate[date] || 0) + 1;
        }
      });
    }
    
    // Convert to array and sort by date
    return Object.entries(reclamationsByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error fetching reclamations over time:", error);
    throw error;
  }
};