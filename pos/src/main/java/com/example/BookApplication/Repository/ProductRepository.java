package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    
}
