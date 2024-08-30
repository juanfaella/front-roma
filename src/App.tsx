// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home/Home";
import Cotizaciones from "./components/Cotizaciones/Cotizaciones";
import Categorias from "./components/Categorias/Categorias";
import Productos from "./components/Productos/Productos";
import CreateProductos from "./components/Productos/CreateProducto";

import Sidebar from "./components/Sidebar/sidebar";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Productos />} />
            <Route path="/cotizaciones" element={<Cotizaciones />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/CreateProducto" element={<CreateProductos />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
