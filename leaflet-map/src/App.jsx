import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/Navbar";
import MapComponent from "./components/MapComponent";
import RoadsOverview from "./pages/RoadsOverview";
import EvaluationsOverview from "./pages/EvaluationsOverview";
import TodosOverview from "./pages/TodosOverview";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<MapComponent />} />
          <Route path="/roads" element={<RoadsOverview />} />
          <Route path="/evaluations" element={<EvaluationsOverview />} />
          <Route path="/todos" element={<TodosOverview />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
