import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

export const uploader = (filePrefix: string, folderName: string) => {
  // 1. Tentukan folder penyimpanan default
  // process.cwd() akan mengambil root folder project (C:\FinalProject\Property_renting_team_3)
  const defaultDir = path.join(process.cwd(), 'public', folderName); 

  // 2. Cek & Buat folder jika belum ada (Auto-create folder)
  // Ini fitur safety agar tidak error ENOENT lagi
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
    console.log(`📂 Folder dibuat otomatis: ${defaultDir}`);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Gunakan folder yang sudah dipastikan ada tadi
      cb(null, defaultDir);
    },
    filename: (req, file, cb) => {
      // Rename file agar unik
      const originalName = file.originalname.replace(/\s+/g, ''); // Hapus spasi
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${filePrefix}-${uniqueSuffix}${path.extname(originalName)}`);
    }
  });

  return multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1 }, // 1MB
    fileFilter: (req: Request, file, cb) => {
      if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true);
      } else {
        cb(new Error('Format file harus .png, .jpg, atau .jpeg!'));
      }
    }
  });
};