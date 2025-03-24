import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    addDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit 
  } from "firebase/firestore";
  import { firestore } from "../lib/firebase";
  
  export const useFirestore = () => {
    // Получение документа
    const getDocument = async (collectionName, docId) => {
      try {
        const docRef = doc(firestore, collectionName, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() };
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error getting document:", error);
        throw error;
      }
    };
  
    // Получение коллекции
    const getCollection = async (collectionName, conditions = []) => {
      try {
        let collectionRef = collection(firestore, collectionName);
        
        if (conditions.length > 0) {
          const queryConstraints = conditions.map(cond => {
            if (cond.type === 'where') {
              return where(cond.field, cond.operator, cond.value);
            } else if (cond.type === 'orderBy') {
              return orderBy(cond.field, cond.direction || 'asc');
            } else if (cond.type === 'limit') {
              return limit(cond.value);
            }
            return null;
          }).filter(Boolean);
          
          collectionRef = query(collectionRef, ...queryConstraints);
        }
        
        const querySnapshot = await getDocs(collectionRef);
        
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        
        return documents;
      } catch (error) {
        console.error("Error getting collection:", error);
        throw error;
      }
    };
  
    // Добавление документа с автоматическим ID
    const addDocument = async (collectionName, data) => {
      try {
        const docRef = await addDoc(collection(firestore, collectionName), data);
        return docRef.id;
      } catch (error) {
        console.error("Error adding document:", error);
        throw error;
      }
    };
  
    // Установка документа с конкретным ID (создание или перезапись)
    const setDocument = async (collectionName, docId, data) => {
      try {
        const docRef = doc(firestore, collectionName, docId);
        await setDoc(docRef, data);
        return true;
      } catch (error) {
        console.error("Error setting document:", error);
        throw error;
      }
    };
  
    // Обновление документа (частичное обновление)
    const updateDocument = async (collectionName, docId, data) => {
      try {
        const docRef = doc(firestore, collectionName, docId);
        await updateDoc(docRef, data);
        return true;
      } catch (error) {
        console.error("Error updating document:", error);
        throw error;
      }
    };
  
    // Удаление документа
    const deleteDocument = async (collectionName, docId) => {
      try {
        const docRef = doc(firestore, collectionName, docId);
        await deleteDoc(docRef);
        return true;
      } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
      }
    };
  
    return {
      getDocument,
      getCollection,
      addDocument,
      setDocument, 
      updateDocument,
      deleteDocument,
    };
  };