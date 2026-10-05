import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  categories: string[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getProducts(this.searchTerm, this.selectedCategory).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Could not load products. Please check if the API server is running.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onFilter(): void {
    this.loadProducts();
  }

  resetFilter(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.loadProducts();
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.successMessage = `Product "${product.name}" deleted successfully.`;
          this.products = this.products.filter(p => p.id !== product.id);
          this.loadCategories();
          setTimeout(() => this.successMessage = '', 4000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete product. Please try again.';
          console.error(err);
          setTimeout(() => this.errorMessage = '', 4000);
        }
      });
    }
  }
}
