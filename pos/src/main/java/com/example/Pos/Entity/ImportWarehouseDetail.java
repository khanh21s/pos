package com.example.Pos.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "import_warehouse_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportWarehouseDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    private int quantity;
    private double costPrice;
    private double totalPrice;
    private String unit;
    
    @ManyToOne
    @JoinColumn(name = "import_warehouse_id")
    private ImportWarehouse importWarehouse;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;
}
