package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Pos.Entity.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    
}
