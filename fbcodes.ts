// Firebase Functions for Firestore and Storage Operations
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import { compare, hash } from "bcryptjs";
import { ref, uploadBytes, getDownloadURL, getStorage, getBlob } from "firebase/storage";
import { db, storage } from "./fb-config";

/**
 * Fetches documents from a collection that match given criteria
 * @param collectionName - Name of the collection to query
 * @param criteria - Object containing key-value pairs to match in documents
 * @returns Promise resolving to an array of matching documents
 */
export const fetchDocumentsByCriteria = async (
  collectionName: string,
  criteria: Record<string, any>,
): Promise<DocumentData[]> => {
  try {
    const collectionRef = collection(db, collectionName);

    // Create a compound query with all criteria
    let q = query(collectionRef);

    // Add where clauses for each criteria key-value pair
    for (const [key, value] of Object.entries(criteria)) {
      q = query(q, where(key, "==", value));
    }

    const querySnapshot = await getDocs(q);

    // Map results to array of documents with IDs
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const deleteDocumentsByCriteria = async (
  collectionName: string,
  criteria: Record<string, any>,
): Promise<number> => {
  try {
    // First, find the documents matching the criteria
    const matchingDocs = await fetchDocumentsByCriteria(collectionName, criteria);

    if (matchingDocs.length === 0) {
      console.warn("No documents found matching the criteria");
      return 0;
    }

    // Import deleteDoc function at the top of your file
    const { deleteDoc } = await import("firebase/firestore");

    // Delete each matching document
    const deletePromises = matchingDocs.map((docData) => {
      const documentRef = doc(db, collectionName, docData.id);
      return deleteDoc(documentRef);
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    // Return the number of documents deleted
    return matchingDocs.length;
  } catch (error) {
    console.error("Error deleting documents by criteria:", error);
    throw error;
  }
};

/**
 * Fetches all documents from a collection
 * @param collectionName - Name of the collection to fetch from
 * @returns Promise resolving to an array of all documents
 */
export const fetchAllDocuments = async (collectionName: string): Promise<DocumentData[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    // Map results to array of documents with IDs
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return documents;
  } catch (error) {
    console.error("Error fetching all documents:", error);
    throw error;
  }
};

/**
 * Adds a new document to a collection
 * @param collectionName - Name of the collection to add to
 * @param documentData - Object containing data for the new document
 * @returns Promise resolving to the ID of the newly created document
 */
export const addDocument = async (
  collectionName: string,
  documentData: Record<string, any>,
): Promise<string> => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...documentData,
      createdAt: new Date(), // Optional: add timestamp
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

/**
 * Uploads a file to Firebase Storage
 * @param directoryName - Directory path in storage where file should be saved
 * @param file - File object to upload
 * @param fileName - Custom filename to save the file as (extension will be preserved)
 * @returns Promise resolving to the download URL of the uploaded file
 */
export const uploadFileToStorage = async (
  directoryName: string,
  file: File,
  fileName: string,
): Promise<string> => {
  try {
    // Get file extension
    const fileExtension = file.name.split(".").pop();

    // Create final filename with extension
    const finalFileName = `${fileName}.${fileExtension}`;

    // Create storage reference
    const storageRef = ref(storage, `${directoryName}/${finalFileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

/**
 * Updates an existing document in a collection based on matching criteria
 * @param collectionName - Name of the collection containing the document
 * @param searchCriteria - Object containing key-value pairs to identify the document(s) to update
 * @param updateData - Object containing the fields to update and their new values
 * @returns Promise resolving to the number of documents updated
 */
export const updateDocumentByCriteria = async (
  collectionName: string,
  searchCriteria: Record<string, any>,
  updateData: Record<string, any>,
): Promise<number> => {
  try {
    // First, find the documents matching the criteria
    const matchingDocs = await fetchDocumentsByCriteria(collectionName, searchCriteria);

    if (matchingDocs.length === 0) {
      console.warn("No documents found matching the criteria");
      return 0;
    }

    // Add last updated timestamp
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Update each matching document
    const updatePromises = matchingDocs.map((docData) => {
      const documentRef = doc(db, collectionName, docData.id);
      return updateDoc(documentRef, dataWithTimestamp);
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Return the number of documents updated
    return matchingDocs.length;
  } catch (error) {
    console.error("Error updating documents by criteria:", error);
    throw error;
  }
};

/**
 * Authenticates a user by checking username and password
 * @param username - Username to check
 * @param password - Plain text password to verify against stored hash
 * @returns Promise resolving to authentication result with user details if successful
 */
export const authCheck = async (
  email: string,
  password: string,
): Promise<{
  authenticated: boolean;
  userId?: string;
  role?: string;
  error?: string;
}> => {
  try {
    // Find user document by username
    const users = await fetchDocumentsByCriteria("f_users", { email });

    // Get the user document
    const user = users[0];

    // Compare provided password with stored hash
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return {
        authenticated: false,
        error: "Invalid password",
      };
    }

    // Authentication successful, return user info
    return {
      authenticated: true,
      userId: user.id,
      role: user.role,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      authenticated: false,
      error: "Authentication failed",
    };
  }
};

/**
 * Registers a new user with hashed password
 * @param userData - User data including username, name, email, pnumber, password, and role
 * @returns Promise resolving to registration result with userId if successful
 */
export const registerUser = async (userData: {
  username: string;
  name: string;
  email: string;
  pnumber: string;
  password: string;
  role: string;
}): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> => {
  try {
    // Check if username already exists
    const existingUsers = await fetchDocumentsByCriteria("f_users", {
      username: userData.username,
    });
    if (existingUsers.length > 0) {
      return {
        success: false,
        error: "Username already exists",
      };
    }

    // Check if email already exists
    const existingEmails = await fetchDocumentsByCriteria("f_users", { email: userData.email });
    if (existingEmails.length > 0) {
      return {
        success: false,
        error: "Email already in use",
      };
    }

    // Hash the password (10 rounds of salting)
    const hashedPassword = await hash(userData.password, 10);

    // Create user object with hashed password
    const newUser = {
      username: userData.username,
      name: userData.name,
      email: userData.email,
      pnumber: userData.pnumber,
      password: hashedPassword,
      role: userData.role,
      createdAt: new Date(),
    };

    // Add user to Firestore
    const userId = await addDocument("f_users", newUser);

    return {
      success: true,
      userId: userId,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "Registration failed",
    };
  }
};

/**
 * Function to fetch a file from Firebase Storage using a URL
 * @param {string} url - The Firebase Storage URL for the file
 * @returns {Promise<Blob>} - A promise that resolves with the file as a Blob
 */
export async function getStorageItemFromUrl(url: string): Promise<Blob> {
  try {
    let path = "";
    if (url.includes("o/")) {
      path = decodeURIComponent(url.split("o/")[1].split("?")[0]);
      console.log("Extracted path:", path);
    } else {
      console.error("Could not extract path from URL:", url);
      throw new Error("Invalid Firebase Storage URL format");
    }

    // If you have a full Firebase Storage URL
    if (url.includes("firebasestorage.googleapis.com")) {
      console.log("Firebase SDK fetch on work---->");
      // Create a reference from the URL
      //const storage = getStorage();
      const httpsReference = ref(storage, path);

      // Get the blob directly to avoid CORS issues
      const blob = await getBlob(httpsReference);
      return blob;
    }
    // If you have a direct download URL
    else {
      // Option 1: Try direct fetch (might have CORS issues)
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return blob;
      } catch (fetchError) {
        console.error("Direct fetch failed, likely due to CORS:", fetchError);

        // Option 2: Try to extract the path and use Firebase reference
        // This is a fallback if you have a download URL but need to access via Firebase
        const storage = getStorage();
        const fileRef = ref(storage, extractPathFromUrl(url));
        const blob = await getBlob(fileRef);
        return blob;
      }
    }
  } catch (error) {
    console.error("Error fetching file from Firebase Storage:", error);
    throw error;
  }
}

/**
 * Helper function to extract a path from a Firebase URL
 * Note: This is a simplified example and may need to be adjusted based on your URL format
 */
export function extractPathFromUrl(url: string): string {
  // This is a simplified approach - you might need to adjust based on your URL structure
  if (url.includes("o/")) {
    const pathPart = url.split("o/")[1];
    return decodeURIComponent(pathPart.split("?")[0]);
  }
  return url;
}

export async function fetchAndUse3DModel(modelUrl: string): Promise<string | void> {
  try {
    const modelBlob = await getStorageItemFromUrl(modelUrl);

    // Create an object URL from the blob that you can use with your 3D library
    const objectUrl = URL.createObjectURL(modelBlob);

    return objectUrl;
  } catch (error) {
    console.error("Failed to fetch 3D model:", error);
  }
}