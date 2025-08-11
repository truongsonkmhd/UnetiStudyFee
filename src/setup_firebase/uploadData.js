// ====================================Dùng để import tự động data vào firebase 
import admin from "firebase-admin";
import fs from "fs";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Đọc file JSON
const rawData = fs.readFileSync("src/config_firebase/data.json", "utf8");

const data = JSON.parse(rawData);

// Import dữ liệu
async function importProjects() {
  const projects = data.projects;

  for (const projectId in projects) {
    const project = projects[projectId];
    try {
      await db.collection("projects").doc(projectId).set(project);
      console.log(`✅ Đã thêm project ID: ${projectId}`);
    } catch (err) {
      console.error(`❌ Lỗi khi thêm project ID: ${projectId}`, err);
    }
  }

  console.log("🎉 Import hoàn tất.");
}

importProjects();
