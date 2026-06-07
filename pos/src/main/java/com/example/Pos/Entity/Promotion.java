package com.example.Pos.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    private String discountType; // 'percent' or 'amount'
    
    @Column(nullable = false)
    private double discountValue;
    
    @Column(columnDefinition = "double default 0")
    private double minOrderValue = 0;
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    @Column(columnDefinition = "boolean default true")
    private boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = true)
    private Category category;
}
