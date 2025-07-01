import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD1ng9ennQk8p5Dq2IBSjeT_v-MfIqXKQM",
    authDomain: "openrockets-data.firebaseapp.com",
    databaseURL: "https://openrockets-data-default-rtdb.firebaseio.com",
    projectId: "openrockets-data",
    storageBucket: "openrockets-data.firebasestorage.app",
    messagingSenderId: "576790834359",
    appId: "1:576790834359:web:5efba611c52e5ba837f132",
    measurementId: "G-HN4LEEGJJW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Database reference for OpenRockets submissions
const SUBMISSIONS_REF = 'openrockets-submissions';

/**
 * Submit form data to Firebase Realtime Database
 * @param {Object} formData - The form data to submit
 * @returns {Promise} - Promise that resolves when data is submitted
 */
export async function submitFormData(formData) {
    try {
        // Add server timestamp to the data
        const dataWithTimestamp = {
            ...formData,
            submittedAt: serverTimestamp()
        };

        // Push data to Firebase
        const submissionsRef = ref(database, SUBMISSIONS_REF);
        const result = await push(submissionsRef, dataWithTimestamp);
        
        console.log('Form data submitted successfully:', result.key);
        return { success: true, id: result.key };
        
    } catch (error) {
        console.error('Error submitting form data:', error);
        throw new Error('Failed to submit form data: ' + error.message);
    }
}

/**
 * Validate Firebase connection
 * @returns {Promise<boolean>} - True if connection is successful
 */
export async function validateConnection() {
    try {
        // Test database connection by getting a reference
        const testRef = ref(database, '.info/connected');
        return true;
    } catch (error) {
        console.error('Firebase connection validation failed:', error);
        return false;
    }
}

// Export Firebase instances for use in other modules
export { app, analytics, database };
