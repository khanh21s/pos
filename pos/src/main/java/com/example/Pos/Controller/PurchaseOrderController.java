package com.example.Pos.Controller;

import com.example.Pos.DTO.PurchaseOrderRequestDTO;
import com.example.Pos.Entity.PurchaseOrder;
import com.example.Pos.Security.RequireRole;
import com.example.Pos.Service.PurchaseOrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @RequireRole("ADMIN")
    @PostMapping
    public ResponseEntity<?> createPurchaseOrder(@RequestBody PurchaseOrderRequestDTO request, HttpServletRequest httpRequest) {
        try {
            Integer userId = (Integer) httpRequest.getAttribute("userId");
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            PurchaseOrder savedPo = purchaseOrderService.createPurchaseOrder(request, userId);
            return new ResponseEntity<>(savedPo, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
