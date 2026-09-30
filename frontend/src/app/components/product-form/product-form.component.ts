import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productForm!: FormGroup;
  isEditMode: boolean = false;
  productId?: number;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  commonCategories: string[] = [
    'Hardware',
    'Accessories',
    'Monitors',
    'Furniture',
    'Books',
    'Audio',
    'Networking',
    'Software'
  ];

  ngOnInit(): void {
    this.initForm();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.productId = +idParam;
      this.loadProductDetails(this.productId);
    }
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      price: [0.01, [Validators.required, Validators.min(0.01), Validators.max(100000.00)]],
      category: ['', [Validators.required, Validators.maxLength(50)]],
      isAvailable: [true]
    });
  }

  private loadProductDetails(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          isAvailable: product.isAvailable
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load product details.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const formValue = this.productForm.value;

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, formValue).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to update product.';
          this.isSubmitting = false;
          console.error(err);
        }
      });
    } else {
      this.productService.createProduct(formValue).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to create product.';
          this.isSubmitting = false;
          console.error(err);
        }
      });
    }
  }
}
