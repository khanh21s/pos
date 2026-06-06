package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Pos.Entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.stock < p.minStock AND p.isActive = true")
    java.util.List<Product> findLowStockProducts();
    
    boolean existsByCategoryId(int categoryId);
}
