import express from 'express';
import {
  generate,
  review,
  format,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
} from '../controllers/documentController';

const router = express.Router();

router.post('/generate', generate);
router.post('/review', review);
router.post('/format', format);
router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;