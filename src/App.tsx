import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Product from './pages/Product';
import Label from './pages/Label';
import Result from './pages/Result';
import Guide from './pages/Guide';
import Help from './pages/Help';
import History from './pages/History';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="scan" element={<Scan />} />
          <Route path="product/:barcode" element={<Product />} />
          <Route path="label/:barcode" element={<Label />} />
          <Route path="result/:barcode" element={<Result />} />
          <Route path="guide" element={<Guide />} />
          <Route path="help" element={<Help />} />
          <Route path="history" element={<History />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
