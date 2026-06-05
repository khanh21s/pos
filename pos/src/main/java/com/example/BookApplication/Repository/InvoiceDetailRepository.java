package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.InvoiceDetail;

public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetail, Integer> {
    
}
