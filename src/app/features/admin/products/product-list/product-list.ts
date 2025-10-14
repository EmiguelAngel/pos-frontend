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

  // Confirmación de eliminación
  showDeleteConfirm = false;
  productToDelete: Product | null = null;

  constructor(private productService: ProductService) {}

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

    if (this.isEditMode) {
      // Actualizar
      this.productService.updateProduct(
        this.currentProduct.idProducto,
        this.currentProduct
      ).subscribe({
        next: () => {
          this.showSuccess(MESSAGES.PRODUCT.UPDATED);
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error actualizando producto:', err);
          this.showError(MESSAGES.PRODUCT.ERROR);
        }
      });
    } else {
      // Crear
      this.productService.createProduct(this.currentProduct).subscribe({
        next: () => {
          this.showSuccess(MESSAGES.PRODUCT.CREATED);
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creando producto:', err);
          this.showError(MESSAGES.PRODUCT.ERROR);
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
    if (!this.productToDelete) return;

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
   * Validar producto
   */
  validateProduct(): boolean {
    if (!this.currentProduct.descripcion.trim()) {
      this.showError('La descripción es requerida');
      return false;
    }
    if (!this.currentProduct.categoria) {
      this.showError('La categoría es requerida');
      return false;
    }
    if (this.currentProduct.precioUnitario <= 0) {
      this.showError('El precio debe ser mayor a 0');
      return false;
    }
    if (this.currentProduct.cantidadDisponible < 0) {
      this.showError('La cantidad no puede ser negativa');
      return false;
    }
    return true;
  }

  /**
   * Obtener producto vacío
   */
  getEmptyProduct(): Product {
    return {
      idProducto: 0,
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
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Mostrar mensaje de error
   */
  showError(message: string): void {
    this.error = message;
    setTimeout(() => {
      this.error = '';
    }, 3000);
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
