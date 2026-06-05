package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.ImportWarehouse;

public interface ImportWarehouseRepository extends JpaRepository<ImportWarehouse, Integer> {
    
}
