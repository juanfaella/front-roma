import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Styled/Cotizaciones.css"; // Asegúrate de importar los estilos

// Importa las imágenes para el encabezado y pie de página
import headerImage from "../assets/HeaderPdf.jpg";
import footerImage from "../assets/FooterPdf.jpg";

// Extender jsPDF con la propiedad lastAutoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Interfaz para un producto
interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

// Interfaz para un elemento de cotización
interface CotizacionItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

const Cotizaciones: React.FC = () => {
  const [cliente, setCliente] = useState("");
  const [presupuesto, setPresupuesto] = useState<number | "">("");
  const [fecha, setFecha] = useState("");
  const [items, setItems] = useState<CotizacionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Producto[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [manoDeObra, setManoDeObra] = useState<number>(0);

  // Buscar productos por nombre
  useEffect(() => {
    if (searchTerm.length > 0) {
      axios
        .get("http://localhost:8080/api/productos")
        .then((response) => {
          // Filtrar los productos localmente
          const filteredProducts = response.data.filter((producto: Producto) =>
            producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setSuggestions(filteredProducts);
        })
        .catch((error) => console.error("Error al buscar productos:", error));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  // Añadir un nuevo producto a la cotización
  const addItem = (producto: Producto) => {
    const newItem: CotizacionItem = {
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precioUnitario: producto.precio,
      total: producto.precio,
    };
    setItems([...items, newItem]);
    setSearchTerm("");
    setSuggestions([]);
  };

  // Actualizar la cantidad de un producto en la cotización
  const updateItemQuantity = (index: number, value: number) => {
    const newItems = [...items];
    newItems[index].cantidad = value;
    newItems[index].total = value * newItems[index].precioUnitario;
    setItems(newItems);
  };

  // Calcular el subtotal de la cotización
  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.total, 0);
  };

  // Generar un PDF con el diseño personalizado
  const generatePDF = (data: any) => {
    const doc = new jsPDF();

    // Agregar el encabezado
    doc.addImage(headerImage, "JPEG", 10, 10, 190, 40);

    // Espacio después del encabezado
    doc.setFontSize(10);
    doc.text(`CLIENTE: ${data.cliente}`, 10, 60);
    doc.text(`PRESUPUESTO: ${data.presupuesto}`, 10, 70);
    doc.text(`FECHA: ${new Date(data.fecha).toLocaleDateString()}`, 10, 80);
    doc.text("DESCRIPCIÓN:", 10, 90);
    doc.text(data.descripcion, 10, 100);

    // Tabla de productos
    const tableColumn = ["CANT.", "DESCRIPCIÓN", "P. UNITARIO", "TOTAL"];
    const tableRows: any[] = [];

    data.items.forEach((item: CotizacionItem) => {
      const productoData = [
        item.cantidad.toString(),
        item.nombre,
        `$${item.precioUnitario.toFixed(2)}`,
        `$${item.total.toFixed(2)}`,
      ];
      tableRows.push(productoData);
    });

    doc.autoTable({
      startY: 110,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0] },
      bodyStyles: { valign: "middle" },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { top: 70 },
    });

    // Subtotal, Mano de Obra y Total
    const subtotal = data.subtotal;
    const total = subtotal + (data.manoDeObra || 0);
    const subtotalY = doc.lastAutoTable.finalY + 10;
    doc.text(`SUBTOTAL: $${subtotal.toFixed(2)}`, 10, subtotalY);
    doc.text(
      `MANO DE OBRA: $${(data.manoDeObra || 0).toFixed(2)}`,
      10,
      subtotalY + 10
    );
    doc.text(`TOTAL: $${total.toFixed(2)}`, 10, subtotalY + 20);

    // Agregar el pie de página
    doc.addImage(
      footerImage,
      "JPEG",
      10,
      doc.internal.pageSize.height - 50,
      190,
      40
    );

    doc.save("cotizacion.pdf");
  };

  // Manejar el envío del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const subtotal = calculateSubtotal();
    const cotizacion = {
      cliente,
      presupuesto: Number(presupuesto),
      fecha: new Date(fecha).toISOString(),
      items,
      subtotal,
      total: subtotal + manoDeObra,
      descripcion,
      manoDeObra,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/cotizaciones",
        cotizacion
      );
      alert("Cotización creada exitosamente");
      generatePDF(cotizacion);
    } catch (error) {
      console.error("Error al crear la cotización:", error);
    }
  };

  return (
    <div className="container">
      <h1>Cotizaciones</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Cliente:</label>
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Presupuesto:</label>
          <input
            type="text"
            value={presupuesto}
            onChange={(e) => setPresupuesto(Number(e.target.value))}
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="label">Descripción:</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="label">Mano de Obra:</label>
          <input
            type="number"
            value={manoDeObra}
            onChange={(e) => setManoDeObra(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <h3>Buscar Producto</h3>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((producto) => (
                <li key={producto.id} onClick={() => addItem(producto)}>
                  {producto.nombre} - ${producto.precio.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-group">
          <h3>Productos en la Cotización</h3>
          <div className="product-list">
            {items.map((item, index) => (
              <div key={index} className="product-item">
                <span>{item.nombre}</span>
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={(e) =>
                    updateItemQuantity(index, Number(e.target.value))
                  }
                  min="1"
                />
                <span>Total: ${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <h3>Subtotal: ${calculateSubtotal().toFixed(2)}</h3>
        </div>
        <button type="submit">Crear Cotización</button>
      </form>
    </div>
  );
};

export default Cotizaciones;
