package com.example.Pos.Service;

import com.example.Pos.DTO.PurchaseOrderDetailRequestDTO;
import com.example.Pos.DTO.PurchaseOrderRequestDTO;
import com.example.Pos.Entity.*;
import com.example.Pos.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private PurchaseOrderDetailRepository purchaseOrderDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Transactional
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequestDTO request, int userId) {
        // 1. Create Purchase Order
        PurchaseOrder po = new PurchaseOrder();
        po.setCreatedAt(LocalDateTime.now());
        po.setStatus("completed");
        po.setTotalCost(request.getTotalCost());
        
        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
            po.setSupplier(supplier);
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        po.setUser(user);
        
        PurchaseOrder savedPo = purchaseOrderRepository.save(po);
        
        // 2. Process details
        for (PurchaseOrderDetailRequestDTO detailReq : request.getDetails()) {
            Product product = productRepository.findById(detailReq.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
                
            boolean isImportUnit = Boolean.TRUE.equals(detailReq.getIsImportUnit());

            // Save Detail
            PurchaseOrderDetail detail = new PurchaseOrderDetail();
            detail.setPurchaseOrder(savedPo);
            detail.setProduct(product);
            detail.setImportQuantity(detailReq.getImportQuantity());
            detail.setImportPrice(detailReq.getImportPrice());
            detail.setSubtotal(detailReq.getSubtotal());
            detail.setIsImportUnit(isImportUnit);
            purchaseOrderDetailRepository.save(detail);
            
            // Core Logic: calculate real quantity and base import price
            int conversionRate = product.getConversionRate() != null && product.getConversionRate() > 0 
                                 ? product.getConversionRate() : 1;
            
            int realQuantity = isImportUnit ? detailReq.getImportQuantity() * conversionRate : detailReq.getImportQuantity();
            double baseImportPrice = isImportUnit ? detailReq.getImportPrice() / conversionRate : detailReq.getImportPrice();
            
            int stockBefore = product.getStock() != null ? product.getStock() : 0;
            int stockAfter = stockBefore + realQuantity;
            
            // Update Product
            product.setStock(stockAfter);
            product.setImportPrice(baseImportPrice);
            productRepository.save(product);
            
            // 3. Save Inventory Transaction
            InventoryTransaction tx = new InventoryTransaction();
            tx.setType("import");
            tx.setReferenceType("purchase_orders");
            tx.setReferenceId(savedPo.getId());
            tx.setQuantity(realQuantity);
            tx.setStockBefore(stockBefore);
            tx.setStockAfter(stockAfter);
            tx.setCreatedAt(LocalDateTime.now());
            tx.setProduct(product);
            tx.setUser(user);
            inventoryTransactionRepository.save(tx);
        }
        
        return savedPo;
    }
}
