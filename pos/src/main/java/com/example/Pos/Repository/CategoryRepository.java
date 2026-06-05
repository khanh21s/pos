package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Pos.Entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
}
