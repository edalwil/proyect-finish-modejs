//models
const { Carts } = require('../models/carts.models');
const { ProductsInCart } = require('../models/productsInCart.models');
const { Products } = require('../models/products.models');
const { Orders } = require('../models/orders.models');

//utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

//listado de productos en el carrito
const getUserCard = catchAsync(async (req, res, next) => {
  //usuario logueado
  const { sessionUser } = req;

  //buscamos los productos en el carrito del usuario
  const searchCartUser = await Carts.findAll({
    where: { id: sessionUser.id, status: 'active' },
    include: [{ model: ProductsInCart, include: [{ model: Products }] }],
  });

  res.status(201).json({
    searchCartUser,
  });
});

//agregar nuevo producto a carrito
const addProductCart = catchAsync(async (req, res, next) => {
  //usuario logueado
  const { sessionUser } = req;

  //datos enviados por el cliente
  const { quantity, productId } = req.body;

  //valida cantida mayor a 0
  if (quantity <= 0) {
    return next(new AppError('quantity cannot be 0', 404));
  }

  // buscar carritos con status activo
  const searchCart = await Carts.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  //buscar producto en el carrito

  //buscar producto
  const searchProduct = await Products.findOne({
    where: { id: productId },
  });

  if (!searchProduct) {
    return next(new AppError('product does not exist', 404));
  }

  //validamos que cantidad que solicita el cliente no supera al del inventerio
  if (quantity > searchProduct.quantity) {
    return next(new AppError('the amount added exceeds the inventory', 404));
  }

  // buscamos si hay producto en carrito con producto id
  const searchProductId = await ProductsInCart.findOne({
    where: { productId, status: 'active' },
  });

  //validamos si hay producto
  if (searchProductId) {
    return next(
      new AppError('the product has already been added to the cart', 404)
    );
  }

  //buscar producto con status removed
  const searchProductRemoved = await ProductsInCart.findOne({
    where: { productId, status: 'removed' },
  });

  // validamos si exite o que cree un carito
  if (!searchCart) {
    const newCart = await Carts.create({ userId: sessionUser.id });

    //agragarmos el el producto en el carrito
    const newProductInCart = await ProductsInCart.create({
      cartId: newCart.id,
      productId,
      quantity,
    });
  } else if (searchProductRemoved) {
    //se le cambia a status active
    await searchProductRemoved.update({
      quantity,
      status: 'active',
    });
  } else {
    //agragarmos el el producto en el carrito
    const newProductInCart = await ProductsInCart.create({
      cartId: searchCart.id,
      productId,
      quantity,
    });
  }

  //enviamos la respuesta
  res.status(200).json({
    status: 'success',
  });
});

const updateProductCart = catchAsync(async (req, res, next) => {
  //datos recibidos del cliente
  const { quantity, productId } = req.body;

  //usuario logiado
  const { sessionUser } = req;

  //buscar si existe un carrito
  const cart = await Carts.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  //validamos el carrito
  if (!cart) {
    return next(new AppError('cart does not exist', 404));
  }

  //buscar el producto en carrito
  const searchProductIdCart = await ProductsInCart.findOne({
    where: { id: productId, status: 'active', cartId: cart.id },
    include: [{ model: Products }],
  });

  //validamos si existe el producto existe en el carrito
  if (!searchProductIdCart) {
    //buscar el producto en carrito
    const searchProductIdCart = await ProductsInCart.findOne({
      where: { id: productId, status: 'removed', cartId: cart.id },
      include: [{ model: Products }],
    });

    const updateProduct = await searchProductIdCart.update({
      quantity,
      status: 'active',
    });

    res.status(200).json({
      updateProduct,
    });
  }

  //validamos que el usuario solo pueda ingrear en cantidad por debajo de la cantidad de inventario
  if (quantity > searchProductIdCart.product.quantity || quantity < 0) {
    return next(
      new AppError('the amount entered exceeds what is in inventory', 404)
    );
  }

  //validamos cantidad en 0
  if (quantity === 0) {
    //cambiamos el status
    const productUpdate = await searchProductIdCart.update({
      status: 'removed',
      quantity: 0,
    });

    //enviamos la respuesta
    res.status(201).json({
      productUpdate,
      status: 'success',
      message: 'product removed successfully',
    });
  } else {
    //actulizamos la cantidad del producto
    const updateProduct = await searchProductIdCart.update({ quantity });

    //enviamos la respuesta
    res.status(201).json({
      updateProduct,
      status: 'success',
      message: 'quantity product modified successfully',
    });
  }
});

const deleteProductCart = catchAsync(async (req, res, next) => {
  //id del producto
  const { productId } = req.params;

  //buscamos el producto en el carrito
  const searchProductIdCart = await ProductsInCart.findOne({
    where: { id: productId, status: 'active' },
  });

  //valdiamos el producto
  if (!searchProductIdCart) {
    return next(new AppError('product is not in the cart', 404));
  }

  //actualizamos el producto
  const deleteProductInCart = await searchProductIdCart.update({
    quantity: 0,
    status: 'removed',
  });

  console.log(deleteProductInCart);

  //enviamos la respuesta
  res.status(201).json({
    deleteProductInCart,
    status: 'success',
  });
});

const purchaseProductCart = catchAsync(async (req, res, next) => {
  //usuario logueado
  const { sessionUser } = req;

  //buscarmos el carrito con status active
  const searchCart = await Carts.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: [
      {
        model: ProductsInCart,
        where: { status: 'active' },
        include: [{ model: Products }],
      },
    ],
  });

  //validamos si el carrito existe
  if (!searchCart) {
    return next(new AppError('cart does not exist', 404));
  }

  //declaramos una variable
  let totalPrice = 0;

  //map para que recorra productInCart
  const mapProductInCart = searchCart.productsInCarts.map(
    async (productCart) => {
      // estraigo su cantidad del producto en inventario
      const updateQuantity =
        productCart.product.quantity - productCart.quantity;

      //actualizamos la cantidad
      const updateValue = await productCart.product.update({
        quantity: updateQuantity,
      });

      //calcular total del precio
      const productPrice =
        productCart.quantity * Number(productCart.product.price);

      //reacinar el valor
      totalPrice = totalPrice + productPrice;

      //cambiar el valor del status
      return await productCart.update({ status: 'purchased' });
    }
  );
  //solucionamos todas las promesas
  await Promise.all(mapProductInCart);

  // creamos la orden
  const createOrder = await Orders.create({
    userId: sessionUser.id,
    cartId: searchCart.id,
    totalPrice,
  });

  res.status(200).json({
    createOrder,
  });
});

module.exports = {
  addProductCart,
  deleteProductCart,
  purchaseProductCart,
  updateProductCart,
  getUserCard,
};
