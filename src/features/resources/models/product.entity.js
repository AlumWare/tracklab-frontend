import { ProductResource } from './product.resource.js'

/**
 * Entidad de Producto para lógica de negocio
 */
export class ProductEntity {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.priceAmount = data.priceAmount || 0;
    this.priceCurrency = data.priceCurrency || 'PEN';
    this.stock = data.stock || 0;
    this.status = this.calculateStatus(data.stock);
    this.manufacturer = data.manufacturer || '';
    this.category = data.category || '';
    this.dimensions = {
      length: data.dimensions?.length || 0,
      width: data.dimensions?.width || 0,
      height: data.dimensions?.height || 0,
      unit: data.dimensions?.unit || 'cm'
    };
    this.weight = {
      value: data.weight?.value || 0,
      unit: data.weight?.unit || 'kg'
    };
    this.specifications = data.specifications || {};
    this.images = data.images || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  /**
   * Calcula el estado del producto basado en el stock
   * @param {number} stock - Stock del producto
   * @returns {string} Estado del producto
   */
  calculateStatus(stock) {
    if (stock <= 0) return 'outOfStock';
    if (stock < 10) return 'lowStock';
    return 'available';
  }

  /**
   * Obtiene el precio formateado con moneda
   * @returns {string}
   */
  getFormattedPrice() {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: this.priceCurrency
    }).format(this.priceAmount);
  }

  /**
   * Verifica si hay stock disponible para una cantidad
   * @param {number} quantity - Cantidad requerida
   * @returns {boolean}
   */
  hasAvailableStock(quantity) {
    return this.stock >= quantity
  }

  /**
   * Verifica si el stock está bajo
   * @returns {boolean}
   */
  hasLowStock() {
    return this.stock < 10
  }

  /**
   * Obtiene el peso formateado
   * @returns {string}
   */
  getFormattedWeight() {
    return `${this.weight.value} ${this.weight.unit}`;
  }

  /**
   * Obtiene las dimensiones formateadas
   * @returns {string}
   */
  getFormattedDimensions() {
    return `${this.dimensions.length}x${this.dimensions.width}x${this.dimensions.height} ${this.dimensions.unit}`;
  }

  /**
   * Obtiene la imagen principal del producto
   * @returns {string}
   */
  getMainImage() {
    return this.images[0] || '/assets/placeholder-product.jpg'
  }

  /**
   * Obtiene el resumen del producto para mostrar en listas
   * @returns {Object}
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.getFormattedPrice(),
      status: this.status,
      mainImage: this.getMainImage()
    }
  }

  /**
   * Obtiene los detalles completos del producto
   * @returns {Object}
   */
  getDetails() {
    return {
      ...this.getSummary(),
      manufacturer: this.manufacturer,
      specifications: this.specifications,
      weight: this.getFormattedWeight(),
      dimensions: this.getFormattedDimensions(),
      images: this.images,
      stock: this.stock,
      createdAt: this.createdAt.toLocaleDateString(),
      updatedAt: this.updatedAt.toLocaleDateString()
    }
  }

  /**
   * Valida si el producto tiene toda la información requerida
   * @returns {boolean}
   */
  isValid() {
    const errors = [];

    if (!this.name) errors.push('El nombre es requerido');
    if (!this.description) errors.push('La descripción es requerida');
    if (this.priceAmount <= 0) errors.push('El precio debe ser mayor a 0');
    if (this.stock < 0) errors.push('El stock no puede ser negativo');
    if (!this.category) errors.push('La categoría es requerida');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Crea una entidad de producto desde una respuesta de API
   * @param {Object} apiResponse - Respuesta de la API
   * @returns {ProductEntity}
   */
  static fromApiResponse(apiResponse) {
    return new ProductEntity({
      id: apiResponse.id,
      name: apiResponse.name,
      description: apiResponse.description,
      priceAmount: apiResponse.priceAmount,
      priceCurrency: apiResponse.priceCurrency,
      category: apiResponse.category,
      stock: apiResponse.stock,
      weight: apiResponse.weight,
      dimensions: apiResponse.dimensions,
      manufacturer: apiResponse.manufacturer,
      specifications: apiResponse.specifications,
      images: apiResponse.images,
      createdAt: apiResponse.createdAt,
      updatedAt: apiResponse.updatedAt
    })
  }

  /**
   * Convierte la entidad a un recurso para enviar a la API
   * @returns {ProductResource}
   */
  toResource() {
    return new ProductResource({
      id: this.id,
      name: this.name,
      description: this.description,
      priceAmount: this.priceAmount,
      priceCurrency: this.priceCurrency,
      category: this.category,
      stock: this.stock
    })
  }

  /**
   * Convierte la entidad a un objeto JSON para almacenamiento
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      priceAmount: this.priceAmount,
      priceCurrency: this.priceCurrency,
      stock: this.stock,
      status: this.status,
      manufacturer: this.manufacturer,
      category: this.category,
      dimensions: this.dimensions,
      weight: this.weight,
      specifications: this.specifications,
      images: this.images,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}
