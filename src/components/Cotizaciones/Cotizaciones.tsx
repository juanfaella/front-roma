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

  // Eliminar un producto de la cotización
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calcular el subtotal de la cotización
  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.total, 0);
  };

  const generatePDF = (data: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Agregar el encabezado
    doc.addImage(headerImage, "JPEG", 0, 0, pageWidth, 60); // Ajusta la altura de la imagen a 60

    // Espacio después del encabezado
    doc.setFontSize(10);

    // Posición de "CLIENTE" y "PRESUPUESTO"
    const startY = 70; // Ajustar la altura inicial

    // Cliente
    doc.setFont("helvetica", "bold");
    doc.text(`CLIENTE: ${data.cliente}`, 10, startY);

    // Presupuesto alineado a la derecha
    doc.text(`PRESUPUESTO: ${data.presupuesto}`, pageWidth - 10, startY, {
      align: "right",
    });

    // Fecha
    doc.text(
      `FECHA: ${new Date(data.fecha).toLocaleDateString()}`,
      10,
      startY + 8
    );

    // Agregar el texto adicional al mismo nivel de la fecha
    doc.text(
      "LOS PRECIOS ESTAN SUJETOS A CAMBIOS COMERCIALES",
      pageWidth - 10,
      startY + 8,
      { align: "right" }
    );

    // Descripción
    doc.text("DESCRIPCIÓN:", 10, startY + 16);
    doc.text(data.descripcion, 10, startY + 24);

    // Función para agregar la tabla de productos
    const addTable = (startY: number, items: CotizacionItem[]) => {
      const tableColumn = ["CANT.", "DESCRIPCIÓN", "P. UNITARIO", "TOTAL"];
      const tableRows: any[] = [];

      items.forEach((item: CotizacionItem) => {
        const productoData = [
          item.cantidad.toString(),
          item.nombre,
          `$${item.precioUnitario.toFixed(2)}`,
          `$${item.total.toFixed(2)}`,
        ];
        tableRows.push(productoData);
      });

      doc.autoTable({
        startY: startY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [55, 23, 10], lineWidth: 0 },
        bodyStyles: { valign: "middle", lineWidth: 0 },
        styles: { fontSize: 10, cellPadding: 1, cellWidth: "auto" },
        margin: { left: 0, right: 0 },
      });
    };

    // Dividir los productos en grupos de 22 para paginación
    const maxItemsPerPage = 22;
    let currentY = startY + 25;
    const itemsChunks = [];

    for (let i = 0; i < data.items.length; i += maxItemsPerPage) {
      itemsChunks.push(data.items.slice(i, i + maxItemsPerPage));
    }

    // Agregar las páginas con las tablas
    itemsChunks.forEach((chunk, pageIndex) => {
      if (pageIndex > 0) {
        doc.addPage();
      }

      // Agregar la tabla de productos
      addTable(currentY, chunk);

      // Dibujar línea separadora debajo de la tabla
      const tableFinalY = doc.lastAutoTable.finalY;
      doc.setDrawColor(150, 75, 0); // Color marrón
      doc.setLineWidth(1); // Grosor de la línea
      doc.line(10, tableFinalY + 10, pageWidth - 10, tableFinalY + 10); // Línea horizontal

      // Ajustar la posición para el pie de página
      currentY = doc.internal.pageSize.height - 30;
    });

    // Subtotal, Mano de Obra y Total alineados a la derecha
    const subtotal = data.subtotal;
    const total = subtotal + (data.manoDeObra || 0);
    const footerY = doc.internal.pageSize.height - 40;

    doc.setFont("helvetica", "bold");
    doc.text(`SUBTOTAL: $${subtotal.toFixed(2)}`, pageWidth - 10, footerY - 5, {
      align: "right",
    });
    doc.text(
      `MANO DE OBRA: $${(data.manoDeObra || 0).toFixed(2)}`,
      pageWidth - 10,
      footerY - 0,
      { align: "right" }
    );
    doc.text(`TOTAL: $${total.toFixed(2)}`, pageWidth - 10, footerY - -5, {
      align: "right",
    });

    // Agregar el pie de página
    doc.addImage(
      footerImage,
      "JPEG",
      0,
      doc.internal.pageSize.height - 30,
      pageWidth,
      30
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
    <div className="cotizaciones">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cliente">Cliente</label>
          <input
            type="text"
            id="cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="presupuesto">Presupuesto</label>
          <input
            type="number"
            id="presupuesto"
            value={presupuesto}
            onChange={(e) => setPresupuesto(Number(e.target.value))}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="fecha">Fecha</label>
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="manoDeObra">Mano de Obra</label>
          <input
            type="number"
            id="manoDeObra"
            value={manoDeObra}
            onChange={(e) => setManoDeObra(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="producto">Buscar producto</label>
          <input
            type="text"
            id="producto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul className="suggestions">
            {suggestions.map((producto) => (
              <li key={producto.id} onClick={() => addItem(producto)}>
                {producto.nombre} - ${producto.precio}
              </li>
            ))}
          </ul>
        </div>
        <div className="cotizacion-items">
          <h3>Productos en Cotización</h3>
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.productoId}>
                  <td>{item.nombre}</td>
                  <td>
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) =>
                        updateItemQuantity(index, Number(e.target.value))
                      }
                      min="1"
                    />
                  </td>
                  <td>${item.precioUnitario.toFixed(2)}</td>
                  <td>${item.total.toFixed(2)}</td>
                  <td>
                    <button type="button" onClick={() => removeItem(index)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="submit">Generar Cotización</button>
      </form>
    </div>
  );
};

export default Cotizaciones;
