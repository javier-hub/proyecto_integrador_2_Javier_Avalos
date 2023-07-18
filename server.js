const express = require("express");
const bodyPaarser = require("body-parser");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;

/* 
DATABASE:
supermercado
COLLECTION:
supermercado
*/

app.use(express.json());

//app.use(bodyPaarser.json());

app.use(require("body-parser").json());

app.use(function (err, req, res, next) {
  // atrapo errores en el formato del body recibido
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    res.status(400).send("Error en el formato json enviado");
  } else next();
});

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

// Ruta de inicio
app.get("/", (req, res) => {
  res.status(200).end("Bienvenido a la API de Supermercado");
});

// Ruta para obtener todos los productos
app.get("/productos", async (req, res) => {
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de supermercado y convertir los documentos a un array
    const db = client.db("supermercado");
    const productos = await db.collection("supermercado").find().toArray();
    res.json(productos);
  } catch (error) {
    // Manejo de errores al obtener los productos
    res.status(500).send("Error al obtener los productos de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un producto por su Codigo
app.get("/producto/:codigo", async (req, res) => {
  const productoCodigo = parseInt(req.params.codigo);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de supermercado y buscar el producto por su ID
    const db = client.db("supermercado");
    const producto = await db
      .collection("supermercado")
      .findOne({ codigo: { $eq: productoCodigo } });
    if (producto) {
      res.json(producto);
    } else {
      res.status(404).send("Producto no encontrada");
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).send("Error al obtener el producto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un producto por su nombre
app.get("/productos/nombre/:nombre", async (req, res) => {
  const productoQuery = req.params.nombre.trim();
  let productoNombre = RegExp(productoQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de supermercado y buscar el producto por su Nombre
    const db = client.db("supermercado");
    const producto = await db
      .collection("supermercado")
      .find({ nombre: productoNombre })
      .toArray();
    // const producto = await db.collection("supermercado").find({ nombre: {$regex: productoNombre}}).toArray();
    if (producto.length > 0) {
      res.json(producto);
    } else {
      res.status(404).send("Producto no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).send("Error al obtener el producto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener todos los productos de una categoria especifica
app.get("/productos/categoria/:categoria", async (req, res) => {
  const productoQuery = req.params.categoria.trim();
  let productosCategoria = RegExp(productoQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de supermercado y buscar los productos por su categoria
    const db = client.db("supermercado");
    // const producto = await db.collection("supermercado").find({ categoria: {$regex: productoCategoria}}).toArray();
    const producto = await db
      .collection("supermercado")
      .find({ categoria: productosCategoria })
      .toArray();

    if (producto.length > 0) {
      res.json(producto);
    } else {
      res.status(404).send("Categoria no encontrada");
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).send("Error al obtener los productos de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un producto por su precio
app.get("/productos/precio/:precio", async (req, res) => {
  const productoPrecio = parseFloat(req.params.precio);
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de supermercado y buscar el producto por su precio
    const db = client.db("supermercado");
    const producto = await db
      .collection("supermercado")
      //.find({ precio: { $gte: productoPrecio } })
      .find({ precio: { $eq: productoPrecio } })
      .toArray();

    if (producto.length > 0) {
      res.json(producto);
    } else {
      res.status(404).send("Producto no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el producto
    res.status(500).send("Error al obtener el producto de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para agregar un nuevo recurso
app.post("/productos", async (req, res) => {
  const nuevoProducto = req.body;
  try {
    if (nuevoProducto === undefined) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("supermercado");
    const collection = db.collection("supermercado");
    await collection.insertOne(nuevoProducto);
    console.log("Nuevo producto creado");
    res.status(201).send(nuevoProducto);
  } catch (error) {
    // Manejo de errores al agregar el producto
    res.status(500).send("Error al intentar agregar un nuevo producto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

//Ruta para modificar un recurso
app.put("/productos/:codigo", async (req, res) => {
  const codigoProducto = parseInt(req.params.codigo);
  const nuevosDatos = req.body;
  try {
    if (!nuevosDatos) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("supermercado");
    const collection = db.collection("supermercado");

    await collection.updateOne(
      { codigo: codigoProducto },
      { $set: nuevosDatos }
    );

    console.log("Producto Modificado");

    res.status(200).send(nuevosDatos);
  } catch (error) {
    // Manejo de errores al modificar la fruta
    res.status(500).send("Error al modificar la fruta");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

//Ruta para modificar el precio de un producto
app.patch("/productos/:codigo", async (req, res) => {
  const codigoProducto = parseInt(req.params.codigo);
  const nuevosDatos = parseFloat(req.body.precio);
  try {
    if (!nuevosDatos) {
      res.status(400).send("Error en el formato del dato a modiicar.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db("supermercado");
    const collection = db.collection("supermercado");

    await collection.updateOne(
      { codigo: codigoProducto },
      { $set: { precio: nuevosDatos } }
    );

    console.log("Producto Modificado");

    res.status(200).send("Producto modificado con exito!");
  } catch (error) {
    // Manejo de errores al modificar la fruta
    res.status(500).send("Error al modificar el producto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para eliminar un recurso
app.delete("/productos/:codigo", async (req, res) => {
  const codigoProducto = parseInt(req.params.codigo);
  try {
    if (!codigoProducto) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de supermercado, buscar el producto por su codigo y eliminarlo
    const db = client.db("supermercado");
    const collection = db.collection("supermercado");
    const resultado = await collection.deleteOne({ codigo: codigoProducto });
    if (resultado.deletedCount === 0) {
      res
        .status(404)
        .send("No se encontró ningun producto con el codigo seleccionado.");
    } else {
      console.log("Producto Eliminado");
      res.status(204).send();
    }
  } catch (error) {
    // Manejo de errores al obtener los productos
    res.status(500).send("Error al eliminar el producto");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Control de rutas inexistentes
app.use("*", (req, res) => {
  res
    .status(404)
    .send(
      `<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`
    );
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
