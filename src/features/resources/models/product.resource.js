/**
 * @typedef {Object} CreateProductResource
 * @property {string} name - Nombre del producto
 * @property {string} description - Descripción del producto
 * @property {number} priceAmount - Cantidad del precio
 * @property {string} priceCurrency - Moneda del precio
 * @property {string} category - Categoría del producto
 * @property {number} stock - Cantidad en stock
 */

/**
 * @typedef {Object} ProductResource
 * @property {number} id - Identificador único del producto
 * @property {string} name - Nombre del producto
 * @property {string} description - Descripción del producto
 * @property {number} priceAmount - Cantidad del precio
 * @property {string} priceCurrency - Moneda del precio
 * @property {string} category - Categoría del producto
 * @property {number} stock - Cantidad en stock
 */

/**
 * Crea un nuevo recurso de producto
 * @param {CreateProductResource} productData - Datos del producto a crear
 * @returns {CreateProductResource} El recurso del producto creado
 */
export const createProductResource = (productData) => {
    return {
        name: productData.name,
        description: productData.description,
        priceAmount: productData.priceAmount,
        priceCurrency: productData.priceCurrency,
        category: productData.category,
        stock: productData.stock
    };
};

/**
 * Crea un recurso de producto completo con ID
 * @param {ProductResource} productData - Datos del producto incluyendo ID
 * @returns {ProductResource} El recurso del producto completo
 */
export const ProductResource = (productData) => {
    return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        priceAmount: productData.priceAmount,
        priceCurrency: productData.priceCurrency,
        category: productData.category,
        stock: productData.stock
    };
};

