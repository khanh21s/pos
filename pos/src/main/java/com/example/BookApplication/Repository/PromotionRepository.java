package com.example.BookApplication.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.BookApplication.Entity.Promotion;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    
}
