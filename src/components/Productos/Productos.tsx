import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Styles/Productos.css";

// Definir la interfaz para un producto
interface Producto {
  id: number;
  nombre: string;
  cantidadStock: number;
  categoria: {
    id: number;
    nombre: string;
  } | null;
  precio: number;
  descripcion: string;
  medidas: string;
}

const Productos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editProducto, setEditProducto] = useState<Producto | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [cantidadStock, setCantidadStock] = useState<number>(0);
  const [precio, setPrecio] = useState<number>(0);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [descripcion, setDescripcion] = useState<string>("");
  const [medidas, setMedidas] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/productos")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          console.error("Datos de productos inválidos:", data);
        }
      })
      .catch((error) => console.error("Error al obtener productos:", error));
  }, []);

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (producto: Producto) => {
    setEditProducto(producto);
    setNombre(producto.nombre);
    setCantidadStock(producto.cantidadStock);
    setPrecio(producto.precio);
    setDescripcion(producto.descripcion);
    setMedidas(producto.medidas);
    setCategoriaId(producto.categoria ? producto.categoria.id : null);
  };

  const handleUpdate = () => {
    if (editProducto) {
      fetch(`http://localhost:8080/api/productos/${editProducto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          precio,
          cantidadStock,
          medidas,
          categoriaId,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text || "Error desconocido");
            });
          }
          return response.json();
        })
        .then((data) => {
          setProductos((prevProductos) =>
            prevProductos.map((producto) =>
              producto.id === editProducto.id ? data : producto
            )
          );
          setEditProducto(null);
        })
        .catch((error) =>
          console.error("Error al actualizar producto:", error.message)
        );
    }
  };

  const handleDeleteClick = (id: number) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este producto?")
    ) {
      fetch(`http://localhost:8080/api/productos/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text || "Error desconocido");
            });
          }
          setProductos((prevProductos) =>
            prevProductos.filter((producto) => producto.id !== id)
          );
        })
        .catch((error) =>
          console.error("Error al eliminar producto:", error.message)
        );
    }
  };

  return (
    <div>
      <h1>Productos</h1>

      <input
        type="text"
        placeholder="Buscar productos por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "8px",
          marginBottom: "20px",
          width: "100%",
          maxWidth: "300px",
        }}
      />
      <button
        className="add-product-button"
        onClick={() => navigate("/CreateProducto")}
      >
        Agregar Producto
      </button>

      {editProducto && (
        <div>
          <h2>Editar Producto</h2>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
          />
          <input
            type="number"
            value={cantidadStock}
            onChange={(e) => setCantidadStock(Number(e.target.value))}
            placeholder="Cantidad en stock"
          />
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(Number(e.target.value))}
            placeholder="Precio"
          />
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
          />
          <input
            type="text"
            value={medidas}
            onChange={(e) => setMedidas(e.target.value)}
            placeholder="Medidas"
          />
          <input
            type="number"
            value={categoriaId ?? ""}
            onChange={(e) => setCategoriaId(Number(e.target.value))}
            placeholder="ID Categoría"
          />
          <button onClick={handleUpdate}>Actualizar Producto</button>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Nombre</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Cantidad Stock
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Precio</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Descripción
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Medidas
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Categoría
            </th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredProductos.map((producto) => (
            <tr key={producto.id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {producto.nombre}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {producto.cantidadStock}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {producto.precio}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {producto.descripcion}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {producto.medidas}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {producto.categoria
                  ? producto.categoria.nombre
                  : "Sin categoría"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  className="BtnEditar"
                  onClick={() => handleEditClick(producto)}
                >
                  Editar
                </button>
                <button
                  className="BtnEliminar"
                  onClick={() => handleDeleteClick(producto.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Productos;
