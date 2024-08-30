import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Styled/Categorias.css";

// Definir la interfaz para una categoría
interface Categoria {
  id: number;
  nombre: string;
}

const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Estado para las categorías
  const [error, setError] = useState<string | null>(null); // Estado para el error
  const [newCategoriaNombre, setNewCategoriaNombre] = useState<string>(""); // Estado para el nombre de la nueva categoría
  const [isAdding, setIsAdding] = useState<boolean>(false); // Estado para controlar la visibilidad del formulario

  // Obtener categorías desde el backend cuando se monta el componente
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/categorias")
      .then((response) => setCategorias(response.data))
      .catch((error) => {
        console.error("Error al obtener categorías:", error);
        setError("Error al obtener categorías");
      });
  }, []);

  // Función para eliminar una categoría
  const handleDelete = (id: number) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")
    ) {
      axios
        .delete(`http://localhost:8080/api/categorias/${id}`)
        .then(() => {
          setCategorias(categorias.filter((categoria) => categoria.id !== id));
        })
        .catch((error) => {
          console.error("Error al eliminar categoría:", error);
          setError("Error al eliminar categoría");
        });
    }
  };

  // Función para agregar una nueva categoría
  const handleAdd = () => {
    if (!newCategoriaNombre.trim()) {
      setError("El nombre de la categoría no puede estar vacío.");
      return;
    }

    axios
      .post("http://localhost:8080/api/categorias", {
        nombre: newCategoriaNombre,
      })
      .then((response) => {
        setCategorias([...categorias, response.data]);
        setNewCategoriaNombre("");
        setIsAdding(false);
      })
      .catch((error) => {
        console.error("Error al agregar categoría:", error);
        setError("Error al agregar categoría");
      });
  };

  return (
    <div>
      <h1>Categorías</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={() => setIsAdding(!isAdding)}
        style={{
          backgroundColor: "green",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "6px 12px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        {isAdding ? "Cancelar" : "Agregar Categoría"}
      </button>

      {isAdding && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={newCategoriaNombre}
            onChange={(e) => setNewCategoriaNombre(e.target.value)}
            placeholder="Nombre de la categoría"
            style={{
              padding: "8px",
              marginRight: "10px",
              width: "200px",
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              backgroundColor: "blue",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Agregar
          </button>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Nombre</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {categoria.nombre}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  onClick={() => handleDelete(categoria.id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
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

export default Categorias;
