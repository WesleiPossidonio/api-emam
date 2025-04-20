import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

// Configuração do Multer para aceitar vídeos
const multerConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // Limite de 50MB para arquivos (ajuste conforme necessário)
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'video/mp4', 'video/avi',  // Vídeos
      'image/jpeg', 'image/png', 'image/gif', // Imagens
      'application/pdf' // PDF
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Apenas MP4, AVI, JPG, PNG, GIF e PDF são permitidos.'));
    }
  },
};

const upload = multer(multerConfig).fields([
  { name: 'videos', maxCount: 3 }, // Aceita até 3 vídeos
  { name: 'images', maxCount: 5 }, // Aceita até 5 imagens
  { name: 'pdfs', maxCount: 5 } // Aceita até 5 PDFs
]);

// Middleware para fazer upload para o Google Drive
const uploadToGoogleDrive = async (req, res, next) => {
  try {
    if (!req.files) {
      throw new Error('Nenhum arquivo encontrado.');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_DRIVE_TYPE,
        project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_DRIVE_AUTH_URI,
        token_uri: process.env.GOOGLE_DRIVE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_DRIVE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_DRIVE_CLIENT_CERT_URL,
        universe_domain: process.env.GOOGLE_DRIVE_UNIVERSE_DOMAIN,
      },
      scopes: 'https://www.googleapis.com/auth/drive',
    });

    const drive = google.drive({ version: 'v3', auth });

    const uploadFile = async (file, folderId) => {
      const fileExt = extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;

      const fileMetadata = {
        name: fileName,
        parents: [folderId], // Pasta específica no Google Drive
      };

      const media = {
        mimeType: file.mimetype,
        body: Readable.from([file.buffer]),
      };

      const response = await drive.files.create({
        resource: fileMetadata,
        media,
        fields: 'webViewLink, id',
      });

      return {
        id: response.data.id,
        link: `https://drive.google.com/file/d/${response.data.id}/view`,
        downloadLink: `https://drive.google.com/uc?id=${response.data.id}&export=download`,
      };
    };

    // Definir pastas diferentes para cada tipo de arquivo no Google Drive
    const videoFolderId = process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID;
    const imageFolderId = process.env.GOOGLE_DRIVE_IMAGE_FOLDER_ID;
    const pdfFolderId = process.env.GOOGLE_DRIVE_PDF_FOLDER_ID;

    let uploadedFiles = {
      videos: [],
      images: [],
      pdfs: [],
    };

    if (req.files.videos) {
      for (const file of req.files.videos) {
        const uploaded = await uploadFile(file, videoFolderId);
        uploadedFiles.videos.push(uploaded);
      }
    }

    if (req.files.images) {
      for (const file of req.files.images) {
        const uploaded = await uploadFile(file, imageFolderId);
        uploadedFiles.images.push(uploaded);
      }
    }

    if (req.files.pdfs) {
      for (const file of req.files.pdfs) {
        const uploaded = await uploadFile(file, pdfFolderId);
        uploadedFiles.pdfs.push(uploaded);
      }
    }

    req.uploadedFiles = uploadedFiles;
    next();
  } catch (error) {
    console.error('Erro ao fazer upload para o Google Drive:', error);
    return res.status(400).json({ error: error.message });
  }
};


// Exportando as funções corretamente
export { upload, uploadToGoogleDrive };
