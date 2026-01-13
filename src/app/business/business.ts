import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data';

/* =========================
   DATA MODELS
========================= */
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  location: string;
}

interface Product {
  id?: number; // REQUIRED for JSON Server
  productId: string;
  productName: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  gstRate: number;
  profit: number;
  gstAmount: number;
  finalPrice: number;
}

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './business.html',
  styleUrls: ['./business.css']
})
export class BusinessComponent implements OnInit {

  /* =========================
     PERSONAL INFO
  ========================= */
  personal: PersonalInfo = {
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    location: ''
  };

  /* =========================
     PRODUCT DATA
  ========================= */
  products: Product[] = [];
  product: Product = this.emptyProduct();
  editIndex: number | null = null;

  /* =========================
     SEARCH & FILTER
  ========================= */
  searchText = '';
  minPrice = 0;

  constructor(private dataService: DataService) {}

  /* =========================
     INITIAL LOAD (API)
  ========================= */
  ngOnInit(): void {
    this.loadProducts();
    this.loadPersonalInfo();
  }

  loadProducts(): void {
    this.dataService.getProducts().subscribe(data => {
      this.products = data;
    });
  }

  loadPersonalInfo(): void {
    this.dataService.getPersonalInfo().subscribe(data => {
      this.personal = data;
    });
  }

  /* =========================
     CREATE / UPDATE
  ========================= */
  saveProduct(): void {
    if (!this.product.productId || !this.product.productName) {
      alert('Product ID and Name are required');
      return;
    }

    this.calculate();

    if (this.editIndex === null) {
      // CREATE
      this.dataService.addProduct(this.product).subscribe(() => {
        this.loadProducts();
        this.resetForm();
      });
    } else {
      // UPDATE
      const id = this.products[this.editIndex].id!;
      this.dataService.updateProduct(id, this.product).subscribe(() => {
        this.loadProducts();
        this.resetForm();
        this.editIndex = null;
      });
    }
  }

  /* =========================
     EDIT
  ========================= */
  editProduct(index: number): void {
    this.product = { ...this.products[index] };
    this.editIndex = index;
  }

  /* =========================
     DELETE
  ========================= */
  deleteProduct(index: number): void {
    const id = this.products[index].id!;
    this.dataService.deleteProduct(id).subscribe(() => {
      this.loadProducts();
    });
  }

  /* =========================
     RESET FORM
  ========================= */
  resetForm(): void {
    this.product = this.emptyProduct();
    this.editIndex = null;
  }

  /* =========================
     CALCULATIONS
  ========================= */
  calculate(): void {
    const selling = this.product.sellingPrice || 0;
    const cost = this.product.costPrice || 0;
    const gst = this.product.gstRate || 0;

    this.product.gstAmount = (selling * gst) / 100;
    this.product.finalPrice = selling + this.product.gstAmount;
    this.product.profit = selling - cost;
  }

  /* =========================
     SAVE PERSONAL INFO
  ========================= */
  savePersonalInfo(): void {
    this.dataService.savePersonalInfo(this.personal).subscribe();
  }

  /* =========================
     DASHBOARD SUMMARY
  ========================= */
  get totalProducts(): number {
    return this.products.length;
  }

  get totalSales(): number {
    return this.products.reduce((sum, p) => sum + p.finalPrice, 0);
  }

  get totalProfit(): number {
    return this.products.reduce((sum, p) => sum + p.profit, 0);
  }

  get totalGST(): number {
    return this.products.reduce((sum, p) => sum + p.gstAmount, 0);
  }

  /* =========================
     SEARCH & FILTER
  ========================= */
  get filteredProducts(): Product[] {
    return this.products.filter(p =>
      (
        p.productName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        p.brand.toLowerCase().includes(this.searchText.toLowerCase())
      ) &&
      p.sellingPrice >= this.minPrice
    );
  }

  /* =========================
     EXPORT CSV
  ========================= */
  exportToCSV(): void {
    if (!this.products.length) {
      alert('No sales data to export');
      return;
    }

    const headers = [
      'Product ID',
      'Product Name',
      'Brand',
      'Cost Price',
      'Selling Price',
      'GST %',
      'GST Amount',
      'Profit',
      'Final Price'
    ];

    const rows = this.products.map(p => [
      p.productId,
      p.productName,
      p.brand,
      p.costPrice,
      p.sellingPrice,
      p.gstRate,
      p.gstAmount,
      p.profit,
      p.finalPrice
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => (csv += row.join(',') + '\n'));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales-data.csv';
    link.click();

    URL.revokeObjectURL(url);
  }

  /* =========================
     EMPTY PRODUCT
  ========================= */
  private emptyProduct(): Product {
    return {
      productId: '',
      productName: '',
      brand: '',
      costPrice: 0,
      sellingPrice: 0,
      gstRate: 0,
      profit: 0,
      gstAmount: 0,
      finalPrice: 0
    };
  }
}
