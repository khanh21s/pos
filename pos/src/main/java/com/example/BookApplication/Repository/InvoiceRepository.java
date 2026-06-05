package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    
}
