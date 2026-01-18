import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Map from './Map';
import Docs from './components/Docs';
import { WalletContextProvider } from './components/WalletContextProvider';

function App() {
  return (
    <WalletContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </Router>
    </WalletContextProvider>
  );
}

export default App;
