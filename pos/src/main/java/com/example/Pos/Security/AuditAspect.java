package com.example.Pos.Security;

import com.example.Pos.Entity.AuditLog;
import com.example.Pos.Repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

@Aspect
@Component
public class AuditAspect {

    @Autowired private AuditLogRepository auditLogRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private OrderRepository orderRepo;
    @Autowired private PromotionRepository promoRepo;
    
    private ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private Integer getCurrentUserId() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                Object userId = request.getAttribute("userId");
                if (userId != null) return (Integer) userId;
            }
        } catch (Exception e) {}
        return null; // Will be null for anonymous or error
    }

    private void saveLog(String action, String tableName, Long recordId, String oldVal, String newVal) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setTableName(tableName);
        log.setRecordId(recordId);
        log.setUserId(getCurrentUserId());
        log.setOldValues(oldVal);
        log.setNewValues(newVal);
        auditLogRepo.save(log);
    }

    private String toJson(Object obj) {
        try {
            return obj != null ? mapper.writeValueAsString(obj) : null;
        } catch (Exception e) {
            return "{\"error\":\"Serialization failed\"}";
        }
    }

    // --- PRODUCT ---
    @Around("execution(* com.example.Pos.Controller.ProductController.addProduct(..))")
    public Object auditCreateProduct(ProceedingJoinPoint pjp) throws Throwable {
        Object result = pjp.proceed();
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> response = (ResponseEntity<?>) result;
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                com.example.Pos.Entity.Product p = (com.example.Pos.Entity.Product) response.getBody();
                saveLog("CREATE_PRODUCT", "products", Long.valueOf(p.getId()), null, toJson(p));
            }
        }
        return result;
    }

    @Around("execution(* com.example.Pos.Controller.ProductController.updateProduct(..))")
    public Object auditUpdateProduct(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();
        int id = (int) args[0];
        Optional<?> oldOpt = productRepo.findById(id);
        String oldJson = oldOpt.isPresent() ? toJson(oldOpt.get()) : null;

        Object result = pjp.proceed();
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> response = (ResponseEntity<?>) result;
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                com.example.Pos.Entity.Product p = (com.example.Pos.Entity.Product) response.getBody();
                saveLog("UPDATE_PRODUCT", "products", Long.valueOf(p.getId()), oldJson, toJson(p));
            }
        }
        return result;
    }

    @Around("execution(* com.example.Pos.Controller.ProductController.deleteProduct(..))")
    public Object auditDeleteProduct(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();
        int id = (int) args[0];
        Optional<?> oldOpt = productRepo.findById(id);
        String oldJson = oldOpt.isPresent() ? toJson(oldOpt.get()) : null;

        Object result = pjp.proceed();
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> response = (ResponseEntity<?>) result;
            if (response.getStatusCode().is2xxSuccessful()) {
                saveLog("DELETE_PRODUCT", "products", (long) id, oldJson, null);
            }
        }
        return result;
    }

    // --- PROMOTION ---
    @Around("execution(* com.example.Pos.Controller.PromotionController.addPromotion(..))")
    public Object auditCreatePromotion(ProceedingJoinPoint pjp) throws Throwable {
        Object result = pjp.proceed();
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> response = (ResponseEntity<?>) result;
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                com.example.Pos.Entity.Promotion promo = (com.example.Pos.Entity.Promotion) response.getBody();
                saveLog("CREATE_PROMOTION", "promotions", Long.valueOf(promo.getId()), null, toJson(promo));
            }
        }
        return result;
    }

    @Around("execution(* com.example.Pos.Controller.PromotionController.updatePromotion(..))")
    public Object auditUpdatePromotion(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();
        Long id = (Long) args[0];
        Optional<?> oldOpt = promoRepo.findById(id);
        String oldJson = oldOpt.isPresent() ? toJson(oldOpt.get()) : null;

        Object result = pjp.proceed();
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> response = (ResponseEntity<?>) result;
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                com.example.Pos.Entity.Promotion promo = (com.example.Pos.Entity.Promotion) response.getBody();
                saveLog("UPDATE_PROMOTION", "promotions", Long.valueOf(promo.getId()), oldJson, toJson(promo));
            }
        }
        return result;
    }

    @Around("execution(* com.example.Pos.Controller.PromotionController.deletePromotion(..))")
    public Object auditDeletePromotion(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();
        Long id = (Long) args[0];
        Optional<?> oldOpt = promoRepo.findById(id);
        String oldJson = oldOpt.isPresent() ? toJson(oldOpt.get()) : null;

        Object result = pjp.proceed();
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> response = (ResponseEntity<?>) result;
            if (response.getStatusCode().is2xxSuccessful()) {
                saveLog("DELETE_PROMOTION", "promotions", id, oldJson, null);
            }
        }
        return result;
    }

    // --- ORDER ---
    @Around("execution(* com.example.Pos.Controller.OrderController.createOrder(..))")
    public Object auditCreateOrder(ProceedingJoinPoint pjp) throws Throwable {
        Object result = pjp.proceed();
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> response = (ResponseEntity<?>) result;
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                com.example.Pos.Entity.Order order = (com.example.Pos.Entity.Order) response.getBody();
                saveLog("CREATE_ORDER", "orders", Long.valueOf(order.getId()), null, toJson(order));
            }
        }
        return result;
    }

    @Around("execution(* com.example.Pos.Controller.OrderController.updateOrder(..))")
    public Object auditUpdateOrder(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();
        int id = (int) args[0];
        Optional<?> oldOpt = orderRepo.findById(id);
        String oldJson = oldOpt.isPresent() ? toJson(oldOpt.get()) : null;

        Object result = pjp.proceed();
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> response = (ResponseEntity<?>) result;
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                com.example.Pos.Entity.Order order = (com.example.Pos.Entity.Order) response.getBody();
                saveLog("UPDATE_ORDER", "orders", Long.valueOf(order.getId()), oldJson, toJson(order));
            }
        }
        return result;
    }

    @Around("execution(* com.example.Pos.Controller.OrderController.refundOrder(..))")
    public Object auditRefundOrder(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();
        int id = (int) args[0];
        Optional<?> oldOpt = orderRepo.findById(id);
        String oldJson = oldOpt.isPresent() ? toJson(oldOpt.get()) : null;

        Object result = pjp.proceed();
        if (result instanceof ResponseEntity) {
            ResponseEntity<?> response = (ResponseEntity<?>) result;
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                com.example.Pos.Entity.Order order = (com.example.Pos.Entity.Order) response.getBody();
                saveLog("REFUND_ORDER", "orders", Long.valueOf(order.getId()), oldJson, toJson(order));
            }
        }
        return result;
    }
}
