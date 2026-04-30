import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../config/database';
import documentRoutes from '../routes/documentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/documents', documentRoutes);

app.get('/', (req, res) => {
  res.send('智能文档生成和审查 Agent API');
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();