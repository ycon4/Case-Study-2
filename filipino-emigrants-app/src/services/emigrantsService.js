import { db } from '../firebase'; // This import remains the same

// Define all collections for different datasets using the compat syntax
const ageCollection = db.collection("age");
const allCountriesCollection = db.collection("allCountries");
const occupationCollection = db.collection("occupation");
const majorCountriesCollection = db.collection("majorCountries");
const civilStatusCollection = db.collection("civilStatus");
const sexCollection = db.collection("sex");
const educationCollection = db.collection("education");
const placeOfOriginCollection = db.collection("placeOfOrigin");
const placeOfOriginProvinceCollection = db.collection("placeOfOriginProvince");

// Generic CRUD functions updated to compat syntax
export const addData = async (collectionRef, data) => {
  try {
    // Replaced addDoc(collectionRef, data) with collectionRef.add(data)
    const docRef = await collectionRef.add(data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

export const getData = async (collectionRef) => {
  try {
    // Replaced getDocs(collectionRef) with collectionRef.get()
    const snapshot = await collectionRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
};

export const updateData = async (collectionRef, id, updates) => {
  try {
    // Replaced updateDoc(doc(collectionRef, id), updates) with a chained command
    await collectionRef.doc(id).update(updates);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteData = async (collectionRef, id) => {
  try {
    // Replaced deleteDoc(doc(collectionRef, id)) with a chained command
    await collectionRef.doc(id).delete();
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

// This part remains the same and will work correctly with the updated functions
export const collections = {
  age: ageCollection,
  allCountries: allCountriesCollection,
  occupation: occupationCollection,
  majorCountries: majorCountriesCollection,
  civilStatus: civilStatusCollection,
  sex: sexCollection,
  education: educationCollection,
  placeOfOrigin: placeOfOriginCollection,
};

// Legacy functions will also work correctly
export const addEmigrant = (data) => addData(civilStatusCollection, data);
export const getEmigrants = () => getData(civilStatusCollection);
export const updateEmigrant = (id, updates) => updateData(civilStatusCollection, id, updates);
export const deleteEmigrant = (id) => deleteData(civilStatusCollection, id);