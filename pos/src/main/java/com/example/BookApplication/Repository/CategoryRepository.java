package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
}
