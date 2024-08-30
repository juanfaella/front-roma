import React, { useState, useEffect } from "react";
import axios from "axios";

interface Categoria {
  id: number;
  nombre: string;
}

const CreateProducto: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState<number | "">("");
  const [cantidadStock, setCantidadStock] = useState<number | "">("");
  const [medidas, setMedidas] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/categorias")
      .then((response) => {
        // Supongamos que el backend devuelve un array de objetos Categoria
        console.log("Datos de categorías:", response.data);
        if (Array.isArray(response.data)) {
          setCategorias(response.data);
        } else {
          setError("Los datos de categorías no están en el formato esperado.");
        }
      })
      .catch((error) => {
        console.error("Error al obtener categorías:", error);
        setError("Error al obtener categorías");
      });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (categoriaId === "") {
      setError("Por favor, selecciona una categoría.");
      return;
    }

    const producto = {
      nombre,
      descripcion,
      precio: precio === "" ? null : precio,
      cantidadStock: cantidadStock === "" ? null : cantidadStock,
      medidas,
      categoriaId,
    };

    try {
      await axios.post("http://localhost:8080/api/productos", producto);
      alert("Producto creado exitosamente");
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setCantidadStock("");
      setMedidas("");
      setCategoriaId("");
    } catch (error) {
      console.error("Error al crear el producto:", error);
      setError("Error al crear el producto");
    }
  };

  return (
    <div>
      <h2>Crear Producto</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Descripción:</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Precio:</label>
          <input
            type="number"
            value={precio}
            onChange={(e) =>
              setPrecio(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
          />
        </div>
        <div>
          <label>Cantidad en Stock:</label>
          <input
            type="number"
            value={cantidadStock}
            onChange={(e) =>
              setCantidadStock(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            required
          />
        </div>
        <div>
          <label>Medidas:</label>
          <input
            type="text"
            value={medidas}
            onChange={(e) => setMedidas(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Categoría:</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(Number(e.target.value))}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Crear Producto</button>
      </form>
    </div>
  );
};

export default CreateProducto;
