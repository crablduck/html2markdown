import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import DocumentScan from "./pages/DocumentScan";
import ConversionConfig from "./pages/ConversionConfig";
import ConversionExecution from "./pages/ConversionExecution";
import ResultsManagement from "./pages/ResultsManagement";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<DocumentScan />} />
            <Route path="/config" element={<ConversionConfig />} />
            <Route path="/convert" element={<ConversionExecution />} />
            <Route path="/results" element={<ResultsManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
