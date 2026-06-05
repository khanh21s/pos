package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    
}
