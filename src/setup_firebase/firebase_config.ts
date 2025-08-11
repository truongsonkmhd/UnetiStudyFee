import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth} from "firebase/auth"
// Cấu hình Firebase cho ứng dụng của bạn
const firebaseConfig = {
  apiKey: "AIzaSyAKPdWcEEHL6OfBEv3W2it1gEYqNxOIVYk",
  authDomain: "contruction-project-management.firebaseapp.com",
  projectId: "contruction-project-management",
  storageBucket: "contruction-project-management.appspot.com", 
  messagingSenderId: "558472881692",
  appId: "1:558472881692:web:39c2d08921f81ebee8e1d9"
}

// Khởi tạo Firebase app
const app = initializeApp(firebaseConfig)

// Khởi tạo Firestore và Storage từ app
const db = getFirestore(app)
const storage = getStorage(app)
const auth = getAuth(app)
export { app, db, storage ,auth }
