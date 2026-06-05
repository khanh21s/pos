package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Pos.Entity.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    
}
