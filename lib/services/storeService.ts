import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Store } from "@/lib/types";

export const getStores = async (): Promise<Store[]> => {
  try {
    const storesCol = collection(db, "Magasin");
    const storesSnapshot = await getDocs(storesCol);
    
    return storesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nom: data.nom || "",
        adresse: data.adresse || "",
        ville: data.ville || "",
        pays: data.pays || "",
        mail: data.mail || "",
        telephone: data.telephone || "",
        latitude: data.latitude || 0,
        longitude: data.longitude || 0
      };
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw error;
  }
};

export const getStoreById = async (id: string): Promise<Store | null> => {
  try {
    const storeDoc = doc(db, "Magasin", id);
    const storeSnapshot = await getDoc(storeDoc);
    
    if (!storeSnapshot.exists()) {
      return null;
    }
    
    const data = storeSnapshot.data();
    return {
      id: storeSnapshot.id,
      nom: data.nom || "",
      adresse: data.adresse || "",
      ville: data.ville || "",
      pays: data.pays || "",
      mail: data.mail || "",
      telephone: data.telephone || "",
      latitude: data.latitude || 0,
      longitude: data.longitude || 0
    };
  } catch (error) {
    console.error("Error fetching store:", error);
    throw error;
  }
};

export const createStore = async (storeData: Omit<Store, "id">): Promise<string> => {
  try {
    const storesCol = collection(db, "Magasin");
    const docRef = await addDoc(storesCol, {
      ...storeData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating store:", error);
    throw error;
  }
};

export const updateStore = async (id: string, storeData: Partial<Store>): Promise<void> => {
  try {
    const storeDoc = doc(db, "Magasin", id);
    await updateDoc(storeDoc, {
      ...storeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating store:", error);
    throw error;
  }
};

export const deleteStore = async (id: string): Promise<void> => {
  try {
    const storeDoc = doc(db, "Magasin", id);
    await deleteDoc(storeDoc);
  } catch (error) {
    console.error("Error deleting store:", error);
    throw error;
  }
};