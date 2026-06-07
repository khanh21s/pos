package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Pos.Entity.Promotion;

import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCode(String code);
}
