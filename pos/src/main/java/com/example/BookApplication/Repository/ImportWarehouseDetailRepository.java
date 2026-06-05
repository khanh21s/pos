package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.ImportWarehouseDetail;

public interface ImportWarehouseDetailRepository extends JpaRepository<ImportWarehouseDetail, Integer> {
    
}
