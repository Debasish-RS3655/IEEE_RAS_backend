import multer from 'multer';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import path from 'path';
import fs from 'fs';
import { isAdmin, isAuthenticated } from '../middlewares/auth.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Create directory if it doesn't exist
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });
const coverPictureRouter = Router();

// Endpoint for uploading cover pictures
coverPictureRouter.post('/file', isAdmin, isAuthenticated, upload.single('coverPicture'), async (req, res) => {
    try {        
        const userId = req.user.id; // Assume user ID is sent in the request body
        if (!req.file) {
            return res.status(400).json({ error: { message: 'No file uploaded.' } });
        }
        const coverPicturePath = `/files/${req.file.filename}`; // Relative path to the file

        // Update the user's cover picture URL in the database
        const user = await prisma.user.update({
            where: { id: userId },
            data: { coverPicture: coverPicturePath },
        });

        res.status(200).json({
            message: 'Cover picture uploaded successfully.',
            coverPicture: coverPicturePath,
            user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { message: 'Internal Server Error.' } });
    }
});

// Endpoint to get all uploaded files
coverPictureRouter.get('/file', isAdmin, isAuthenticated, (req, res) => {
    try {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            return res.status(404).json({ error: { message: 'No files found.' } });
        }

        const files = fs.readdirSync(uploadPath).map(file => ({
            name: file,
            path: `/files/${file}`,
        }));

        return res.status(200).json({ files });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { message: 'Internal Server Error.' } });
    }
});

// Endpoint to delete a file by its filename
coverPictureRouter.delete('/file/:filename', isAdmin, isAuthenticated, (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: { message: 'File not found.' } });
        }

        fs.unlinkSync(filePath); // Delete the file
        return res.status(200).json({ message: 'File deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { message: 'Internal Server Error.' } });
    }
});

export { coverPictureRouter };
