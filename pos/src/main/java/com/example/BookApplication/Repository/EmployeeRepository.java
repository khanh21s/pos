package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    
}
