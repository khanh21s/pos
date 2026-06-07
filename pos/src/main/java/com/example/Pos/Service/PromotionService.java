package com.example.Pos.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Pos.Entity.Promotion;
import com.example.Pos.Entity.Product;
import com.example.Pos.Repository.PromotionRepository;
import com.example.Pos.Repository.ProductRepository;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Promotion addPromotion(Promotion promotion) {
        if (promotion.getEndDate() != null && promotion.getStartDate() != null) {
            if (promotion.getEndDate().isBefore(promotion.getStartDate())) {
                throw new RuntimeException("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
            }
        }
        if ("percent".equalsIgnoreCase(promotion.getDiscountType()) && promotion.getDiscountValue() > 100) {
            throw new RuntimeException("Giảm theo phần trăm không được vượt quá 100.");
        }
        return promotionRepository.save(promotion);
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Optional<Promotion> getPromotionById(Long id) {
        return promotionRepository.findById(id);
    }

    @Transactional
    public Promotion updatePromotion(Long id, Promotion promotionDetails) {
        Optional<Promotion> existingPromotion = promotionRepository.findById(id);
        if (existingPromotion.isPresent()) {
            Promotion promotion = existingPromotion.get();
            if (promotionDetails.getCode() != null) {
                promotion.setCode(promotionDetails.getCode());
            }
            if (promotionDetails.getDiscountType() != null) {
                promotion.setDiscountType(promotionDetails.getDiscountType());
            }
            if (promotionDetails.getDiscountValue() >= 0) {
                promotion.setDiscountValue(promotionDetails.getDiscountValue());
            }
            if (promotionDetails.getMinOrderValue() >= 0) {
                promotion.setMinOrderValue(promotionDetails.getMinOrderValue());
            }
            if (promotionDetails.getStartDate() != null) {
                promotion.setStartDate(promotionDetails.getStartDate());
            }
            if (promotionDetails.getEndDate() != null) {
                promotion.setEndDate(promotionDetails.getEndDate());
            }
            
            if (promotion.getEndDate() != null && promotion.getStartDate() != null) {
                if (promotion.getEndDate().isBefore(promotion.getStartDate())) {
                    throw new RuntimeException("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
                }
            }
            if ("percent".equalsIgnoreCase(promotion.getDiscountType()) && promotion.getDiscountValue() > 100) {
                throw new RuntimeException("Giảm theo phần trăm không được vượt quá 100.");
            }

            promotion.setActive(promotionDetails.isActive());
            
            return promotionRepository.save(promotion);
        }
        return null;
    }

    @Transactional
    public boolean deletePromotion(Long id) {
        if (promotionRepository.existsById(id)) {
            promotionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Map<String, Object> applyPromotion(String code, double orderTotal, List<Map<String, Object>> orderDetails) {
        Promotion promotion = promotionRepository.findByCode(code)
            .orElseThrow(() -> new RuntimeException("Mã khuyến mãi không tồn tại!"));

        if (!promotion.isActive()) {
            throw new RuntimeException("Mã khuyến mãi đã bị vô hiệu hóa.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (promotion.getStartDate() != null && now.isBefore(promotion.getStartDate())) {
            throw new RuntimeException("Mã khuyến mãi chưa tới thời gian áp dụng.");
        }

        if (promotion.getEndDate() != null && now.isAfter(promotion.getEndDate())) {
            throw new RuntimeException("Mã khuyến mãi đã hết hạn.");
        }

        double validTotal = 0;
        if (promotion.getCategory() == null) {
            validTotal = orderTotal;
        } else {
            Integer categoryId = promotion.getCategory().getId();
            for (Map<String, Object> item : orderDetails) {
                Integer productId = Integer.parseInt(item.get("productId").toString());
                double itemSubtotal = 0;
                if (item.containsKey("subtotal")) {
                    itemSubtotal = Double.parseDouble(item.get("subtotal").toString());
                } else {
                    double sellPrice = Double.parseDouble(item.get("sellPrice").toString());
                    double quantity = Double.parseDouble(item.get("quantity").toString());
                    itemSubtotal = sellPrice * quantity;
                }
                
                Product product = productRepository.findById(productId).orElse(null);
                if (product != null && product.getCategory() != null && product.getCategory().getId().equals(categoryId)) {
                    validTotal += itemSubtotal;
                }
            }
            if (validTotal == 0) {
                throw new RuntimeException("Hóa đơn không có sản phẩm nào thuộc danh mục khuyến mãi hợp lệ.");
            }
        }

        if (validTotal < promotion.getMinOrderValue()) {
            throw new RuntimeException("Sản phẩm hợp lệ chưa đạt giá trị tối thiểu " + promotion.getMinOrderValue() + "đ để áp dụng mã này.");
        }

        double discountAmount = 0;
        if ("percent".equalsIgnoreCase(promotion.getDiscountType())) {
            discountAmount = Math.floor(validTotal * promotion.getDiscountValue() / 100);
        } else {
            discountAmount = promotion.getDiscountValue();
            if (discountAmount > validTotal) {
                discountAmount = validTotal;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("promotion", promotion);
        result.put("discountAmount", discountAmount);

        return result;
    }
}
