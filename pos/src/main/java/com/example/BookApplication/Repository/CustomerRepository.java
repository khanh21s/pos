package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    
}
