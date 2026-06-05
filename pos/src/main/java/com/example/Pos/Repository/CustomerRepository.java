package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Pos.Entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    
}
