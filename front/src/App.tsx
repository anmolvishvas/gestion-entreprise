import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Fournisseurs from './pages/Fournisseurs';
import Inventaire from './pages/Inventaire';
import Comptabilite from './pages/Comptabilite';
import Stock from './pages/Stock';
import StockEntry from './pages/StockEntry';
import StockExit from './pages/StockExit';
import StockList from './pages/StockList';
import ItemTypes from './pages/ItemTypes';
import StockMovements from './pages/StockMovements';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={
        <PrivateRoute>
          <AppProvider>
            <Layout />
          </AppProvider>
        </PrivateRoute>
      }>
        <Route index element={<Fournisseurs />} />
        <Route path="fournisseurs" element={<Fournisseurs />} />
        <Route path="inventaire" element={<Inventaire />} />
        <Route path="comptabilite" element={<Comptabilite />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="stock">
          <Route index element={<Stock />} />
          <Route path="entree" element={<StockEntry />} />
          <Route path="sortie" element={<StockExit />} />
          <Route path="liste" element={<StockList />} />
          <Route path="movements" element={<StockMovements />} />
          <Route path="types" element={<ItemTypes />} />
        </Route>
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
 