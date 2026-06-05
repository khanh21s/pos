package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Pos.Entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    
}
