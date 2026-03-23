import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on route (avatars vs documents)
    let folder = 'educonnect/documents';
    if (req.url.includes('avatar')) folder = 'educonnect/avatars';
    if (req.url.includes('quiz')) folder = 'educonnect/quizzes';
    
    // Check file type to allow raw files (like PDFs) or images
    let resource_type = 'auto'; // automatically detecting standard images
    const fileType = file.mimetype;
    
    // Cloudinary treats PDF and doc files as 'raw' or 'image' depending on settings
    // But 'auto' usually works best unless specifically raw.
    if (fileType === 'application/pdf' || fileType.includes('document')) {
      resource_type = 'raw';
    }

    return {
      folder: folder,
      public_id: Date.now() + '-' + Math.round(Math.random() * 1e9),
      resource_type: resource_type
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, JPEG, PNG'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

export default upload;
