import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DocumentGenerator from './pages/DocumentGenerator';
import DocumentReviewer from './pages/DocumentReviewer';
import DocumentHistory from './pages/DocumentHistory';
import DocumentDetail from './pages/DocumentDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<DocumentGenerator />} />
            <Route path="/review" element={<DocumentReviewer />} />
            <Route path="/history" element={<DocumentHistory />} />
            <Route path="/document/:id" element={<DocumentDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;