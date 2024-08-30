import React, { useEffect, useState } from "react";
import axios from "axios";

interface Producto {
  id: number;
  nombre: string;
  precio: number; // Asegúrate de que `precio` es un número
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Cotizacion {
  id: number;
  total: number; // Asegúrate de que `total` es un número
}

const Home: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productosResponse = await axios.get<Producto[]>(
          "/api/productos/latest?limit=5"
        );
        setProductos(productosResponse.data);

        const categoriasResponse = await axios.get<Categoria[]>(
          "http://localhost:8080/api/categorias/latest"
        );
        setCategorias(categoriasResponse.data);

        const cotizacionesResponse = await axios.get<Cotizacion[]>(
          "/api/cotizaciones/latest?limit=5"
        );
        setCotizaciones(cotizacionesResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Bienvenido a Roma Amoblamientos</h1>
      <p>Aquí puedes gestionar tus productos, categorías, y cotizaciones.</p>
      <h2>Últimos Productos</h2>
      <ul>
        {productos.map((producto) => (
          <li key={producto.id}>
            {producto.nombre} - ${producto.precio.toFixed(2)}
          </li>
        ))}
      </ul>
      <h2>Últimas Categorías</h2>
      <ul>
        {categorias.map((categoria) => (
          <li key={categoria.id}>{categoria.nombre}</li>
        ))}
      </ul>
      <h2>Últimas Cotizaciones</h2>
      <ul>
        {cotizaciones.map((cotizacion) => (
          <li key={cotizacion.id}>
            Cotización ID: {cotizacion.id} - Total: $
            {cotizacion.total.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
