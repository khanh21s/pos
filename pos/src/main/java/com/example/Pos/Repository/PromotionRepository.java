package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Pos.Entity.Promotion;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    
}
