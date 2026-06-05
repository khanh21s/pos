package com.example.Pos.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    private String name;
    private String sku;
    private String barcode;
    
    private double importPrice;
    private double sellPrice;
    
    private String importUnit;
    private String sellUnit;
    private int conversionRate;
    
    private int stock;
    private int minStock;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    private String description;
    private boolean isActive;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
