// src/app/features/admin/products/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models';
import { CATEGORIES, MESSAGES } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SidebarComponent],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Filtros
  searchTerm = '';
  selectedCategory = '';
  categories = CATEGORIES;

  // Modal de producto
  showModal = false;
  isEditMode = false;
  currentProduct: Product = this.getEmptyProduct();

  // Estados
  loading = true;
  error = '';
  successMessage = '';
  formErrors: { [key: string]: string } = {};

  // Confirmación de eliminación
  showDeleteConfirm = false;
  productToDelete: Product | null = null;

  constructor(private productService: ProductService) {}

  /**
   * Validar precio al perder el foco
   */
  onPriceBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    
    if (isNaN(value) || value < 1) {
      input.value = '1';
      this.currentProduct.precioUnitario = 1;
    } else {
      this.currentProduct.precioUnitario = value;
    }
  }

  /**
   * Validar cantidad al perder el foco
   */
  onQuantityBlur(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    
    if (isNaN(value) || value < 0) {
      input.value = '0';
      this.currentProduct.cantidadDisponible = 0;
    } else {
      this.currentProduct.cantidadDisponible = value;
    }
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * 🔌 Cargar productos desde la API
   */
  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        this.error = 'Error al cargar productos. Verifica tu conexión con el API.';
        this.loading = false;
      }
    });
  }

  /**
   * Filtrar productos
   */
  filterProducts(): void {
    let filtered = this.products;

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.descripcion.toLowerCase().includes(search) ||
        p.categoria.toLowerCase().includes(search)
      );
    }

    // Filtro por categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.categoria === this.selectedCategory);
    }

    this.filteredProducts = filtered;
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filteredProducts = this.products;
  }

  /**
   * Abrir modal para crear producto
   */
  openCreateModal(): void {
    this.isEditMode = false;
    this.currentProduct = this.getEmptyProduct();
    this.showModal = true;
  }

  /**
   * Abrir modal para editar producto
   */
  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.currentProduct = { ...product };
    this.showModal = true;
  }

  /**
   * Cerrar modal
   */
  closeModal(): void {
    this.showModal = false;
    this.currentProduct = this.getEmptyProduct();
  }

  /**
   * 🔌 Guardar producto (crear o actualizar)
   */
  saveProduct(): void {
    if (!this.validateProduct()) {
      return;
    }

    // Preparar el producto para enviar
    const productToSave: Product = {
      ...this.currentProduct,
      precioUnitario: this.currentProduct.precioUnitario || 0,
      cantidadDisponible: this.currentProduct.cantidadDisponible || 0
    };

    if (this.isEditMode) {
      // Actualizar
      if (!productToSave.idProducto) {
        this.showError('Error: ID de producto no válido');
        return;
      }

      this.productService.updateProduct(
        productToSave.idProducto,
        productToSave
      ).subscribe({
        next: () => {
          this.showSuccess(MESSAGES.PRODUCT.UPDATED);
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error actualizando producto:', err);
          this.showError(err.message || MESSAGES.PRODUCT.ERROR);
        }
      });
    } else {
      // Crear - Asegurarnos de no enviar el ID
      const { idProducto, ...newProduct } = productToSave;
      console.log('Intentando crear producto:', newProduct);
      
      this.productService.createProduct(newProduct).subscribe({
        next: (product) => {
          console.log('Producto creado exitosamente:', product);
          this.showSuccess(MESSAGES.PRODUCT.CREATED);
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creando producto:', err);
          this.showError(err.message || MESSAGES.PRODUCT.ERROR);
        }
      });
    }
  }

  /**
   * Confirmar eliminación
   */
  confirmDelete(product: Product): void {
    this.productToDelete = product;
    this.showDeleteConfirm = true;
  }

  /**
   * Cancelar eliminación
   */
  cancelDelete(): void {
    this.productToDelete = null;
    this.showDeleteConfirm = false;
  }

  /**
   * 🔌 Eliminar producto
   */
  deleteProduct(): void {
    if (!this.productToDelete || !this.productToDelete.idProducto) {
      this.showError('Error: No se puede eliminar el producto');
      return;
    }

    this.productService.deleteProduct(this.productToDelete.idProducto).subscribe({
      next: () => {
        this.showSuccess(MESSAGES.PRODUCT.DELETED);
        this.loadProducts();
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Error eliminando producto:', err);
        this.showError(MESSAGES.PRODUCT.ERROR);
        this.cancelDelete();
      }
    });
  }

  /**
   * Validar un campo específico
   */
  validateField(field: string): void {
    switch (field) {
      case 'descripcion':
        if (!this.currentProduct.descripcion?.trim()) {
          this.showError('La descripción es requerida', field);
        }
        break;
      case 'categoria':
        if (!this.currentProduct.categoria?.trim()) {
          this.showError('La categoría es requerida', field);
        }
        break;
      case 'precioUnitario':
        if (!this.currentProduct.precioUnitario || this.currentProduct.precioUnitario <= 0) {
          this.showError('El precio debe ser mayor a 0', field);
        }
        break;
      case 'cantidadDisponible':
        if (this.currentProduct.cantidadDisponible === null || 
            this.currentProduct.cantidadDisponible === undefined || 
            this.currentProduct.cantidadDisponible < 0) {
          this.showError('La cantidad no puede ser negativa', field);
        }
        break;
    }
  }

  /**
   * Validar producto completo
   */
  validateProduct(): boolean {
    let isValid = true;

    // Validar cada campo
    ['descripcion', 'categoria', 'precioUnitario', 'cantidadDisponible'].forEach(field => {
      this.validateField(field);
      if (this.formErrors[field]) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Obtener producto vacío
   */
  getEmptyProduct(): Product {
    return {
      idProducto: null,
      descripcion: '',
      categoria: '',
      precioUnitario: 0,
      cantidadDisponible: 0
    };
  }

  /**
   * Mostrar mensaje de éxito
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    this.error = '';
    this.formErrors = {};
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Mostrar mensaje de error
   */
  showError(message: string, field?: string): void {
    if (field) {
      this.formErrors[field] = message;
    } else {
      this.error = message;
    }
    this.successMessage = '';
    setTimeout(() => {
      if (field) {
        delete this.formErrors[field];
      } else {
        this.error = '';
      }
    }, 5000);
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Obtener clase de stock
   */
  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-empty';
    if (stock <= 5) return 'stock-critical';
    if (stock <= 10) return 'stock-low';
    return 'stock-ok';
  }
}
