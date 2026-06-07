package com.example.Pos.Controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.Pos.Security.RequireRole;

import com.example.Pos.Entity.Promotion;
import com.example.Pos.Service.PromotionService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @RequireRole("ADMIN")
    @PostMapping
    public ResponseEntity<?> addPromotion(@RequestBody Promotion promotion) {
        try {
            Promotion savedPromotion = promotionService.addPromotion(promotion);
            return new ResponseEntity<>(savedPromotion, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            Map<String, String> res = new HashMap<>();
            res.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequireRole("ADMIN")
    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        try {
            List<Promotion> promotions = promotionService.getAllPromotions();
            return new ResponseEntity<>(promotions, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequireRole("ADMIN")
    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getPromotionById(@PathVariable Long id) {
        try {
            Optional<Promotion> promotion = promotionService.getPromotionById(id);
            if (promotion.isPresent()) {
                return new ResponseEntity<>(promotion.get(), HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequireRole("ADMIN")
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id, @RequestBody Promotion promotion) {
        try {
            Promotion updatedPromotion = promotionService.updatePromotion(id, promotion);
            if (updatedPromotion != null) {
                return new ResponseEntity<>(updatedPromotion, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            Map<String, String> res = new HashMap<>();
            res.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @RequireRole("ADMIN")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        try {
            if (promotionService.deletePromotion(id)) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyPromotion(@RequestBody Map<String, Object> payload) {
        try {
            String code = (String) payload.get("code");
            double orderTotal = Double.parseDouble(payload.get("orderTotal").toString());
            
            List<Map<String, Object>> orderDetails = null;
            if (payload.containsKey("orderDetails")) {
                orderDetails = (List<Map<String, Object>>) payload.get("orderDetails");
            } else {
                orderDetails = new java.util.ArrayList<>();
            }
            
            Map<String, Object> result = promotionService.applyPromotion(code, orderTotal, orderDetails);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (RuntimeException e) {
            Map<String, String> res = new HashMap<>();
            res.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
