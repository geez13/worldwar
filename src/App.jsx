import Map from './Map';
import { WalletContextProvider } from './components/WalletContextProvider';

function App() {
  return (
    <WalletContextProvider>
      <Map />
    </WalletContextProvider>
  );
}

export default App;
