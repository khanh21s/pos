package com.example.Pos.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Pos.Entity.Promotion;
import com.example.Pos.Repository.PromotionRepository;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Transactional
    public Promotion addPromotion(Promotion promotion) {
        return promotionRepository.save(promotion);
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Optional<Promotion> getPromotionById(int id) {
        return promotionRepository.findById(id);
    }

    @Transactional
    public Promotion updatePromotion(int id, Promotion promotionDetails) {
        Optional<Promotion> existingPromotion = promotionRepository.findById(id);
        if (existingPromotion.isPresent()) {
            Promotion promotion = existingPromotion.get();
            if (promotionDetails.getCode() != null) {
                promotion.setCode(promotionDetails.getCode());
            }
            if (promotionDetails.getDescription() != null) {
                promotion.setDescription(promotionDetails.getDescription());
            }
            if (promotionDetails.getDiscountPercent() >= 0) {
                promotion.setDiscountPercent(promotionDetails.getDiscountPercent());
            }
            if (promotionDetails.getDiscountAmount() >= 0) {
                promotion.setDiscountAmount(promotionDetails.getDiscountAmount());
            }
            if (promotionDetails.getUsageLimit() >= 0) {
                promotion.setUsageLimit(promotionDetails.getUsageLimit());
            }
            if (promotionDetails.getStatus() != null) {
                promotion.setStatus(promotionDetails.getStatus());
            }
            return promotionRepository.save(promotion);
        }
        return null;
    }

    @Transactional
    public boolean deletePromotion(int id) {
        if (promotionRepository.existsById(id)) {
            promotionRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
