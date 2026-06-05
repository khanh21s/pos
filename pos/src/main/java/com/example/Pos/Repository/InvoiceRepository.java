package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Pos.Entity.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    
}
