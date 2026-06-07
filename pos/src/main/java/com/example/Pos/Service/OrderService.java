package com.example.Pos.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.Pos.DTO.OrderRequestDTO;
import com.example.Pos.DTO.OrderDetailDTO;
import com.example.Pos.Entity.Order;
import com.example.Pos.Entity.OrderDetail;
import com.example.Pos.Entity.Product;
import com.example.Pos.Entity.Customer;
import com.example.Pos.Entity.User;
import com.example.Pos.Repository.OrderRepository;
import com.example.Pos.Repository.OrderDetailRepository;
import com.example.Pos.Repository.ProductRepository;
import com.example.Pos.Repository.CustomerRepository;
import com.example.Pos.Repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderDetailRepository orderDetailRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private UserRepository userRepository;

    @Autowired private com.example.Pos.Repository.InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired private com.example.Pos.Repository.PromotionRepository promotionRepository;

    public List<Order> getOrdersByStatus(String status) {
        if (status == null) {
            return orderRepository.findAll();
        }
        return orderRepository.findByStatusOrderByIdDesc(status);
    }

    public List<Order> getAllOrdersHistory() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Order refundOrder(int orderId, int adminUserId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + orderId));

        if (!"COMPLETED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể hoàn tiền đơn hàng đã hoàn thành (COMPLETED)");
        }

        if (order.getCustomer() == null) {
            throw new RuntimeException("Chính sách cửa hàng chỉ hỗ trợ đổi/trả cho Khách hàng thành viên.");
        }

        order.setStatus("refunded");
        Order savedOrder = orderRepository.save(order);

        // Hoàn kho & Ghi log Thẻ kho
        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Product product = detail.getProduct();
                boolean isImportUnit = Boolean.TRUE.equals(detail.getIsImportUnit());
                int conversionRate = product.getConversionRate() != null && product.getConversionRate() > 0 
                                     ? product.getConversionRate() : 1;
                int realQuantity = isImportUnit ? detail.getQuantity() * conversionRate : detail.getQuantity();

                int stockBefore = product.getStock() != null ? product.getStock() : 0;
                int stockAfter = stockBefore + realQuantity;

                product.setStock(stockAfter);
                productRepository.save(product);

                // Ghi log Thẻ kho
                com.example.Pos.Entity.InventoryTransaction tx = new com.example.Pos.Entity.InventoryTransaction();
                tx.setProduct(product);
                tx.setType("return");
                tx.setQuantity(realQuantity);
                tx.setStockBefore(stockBefore);
                tx.setStockAfter(stockAfter);
                tx.setReferenceType("orders");
                tx.setReferenceId(savedOrder.getId());
                tx.setCreatedAt(LocalDateTime.now());
                
                User admin = userRepository.findById(adminUserId).orElse(null);
                tx.setUser(admin);
                
                inventoryTransactionRepository.save(tx);
            }
        }

        // Hoàn trả điểm CRM
        Customer customer = order.getCustomer();
        if (customer != null) {
            double currentPoints = customer.getPoints() != null ? customer.getPoints() : 0.0;
            
            // Trả lại điểm khách đã dùng
            currentPoints += order.getUsedPoints();

            // Tính toán lại số điểm khách đã NHẬN từ đơn hàng này để truy thu
            double multiplier = 1.0;
            if ("KIM CƯƠNG".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 2.0;
            else if ("VÀNG".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 1.5;
            else if ("BẠC".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 1.2;

            int baseEarnedPoints = (int) Math.floor((order.getTotalPrice() - order.getDiscountAmount()) / 10000.0);
            int earnedPoints = (int) Math.round(baseEarnedPoints * multiplier);
            if (earnedPoints < 0) earnedPoints = 0;

            currentPoints -= earnedPoints;
            if (currentPoints < 0) currentPoints = 0.0;

            String newTier = "ĐỒNG";
            if (currentPoints >= 1500) newTier = "KIM CƯƠNG";
            else if (currentPoints >= 500) newTier = "VÀNG";
            else if (currentPoints >= 200) newTier = "BẠC";

            // Deduct from totalSpent
            double paidForThisOrder = order.getTotalPrice() - order.getDiscountAmount() - order.getPromotionDiscount();
            double currentTotalSpent = customer.getTotalSpent() != null ? customer.getTotalSpent() : 0.0;
            double newTotalSpent = currentTotalSpent - paidForThisOrder;
            if (newTotalSpent < 0) newTotalSpent = 0.0;

            customer.setPoints(currentPoints);
            customer.setMembershipTier(newTier);
            customer.setTotalSpent(newTotalSpent);
            customerRepository.save(customer);
        }

        return savedOrder;
    }

    private void handleLoyaltyPoints(Customer customer, OrderRequestDTO dto) {
        if (customer == null) return;
        
        double multiplier = 1.0;
        if ("KIM CƯƠNG".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 2.0;
        else if ("VÀNG".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 1.5;
        else if ("BẠC".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 1.2;

        int baseEarnedPoints = (int) Math.floor((dto.getTotalPrice() - dto.getDiscountAmount() - dto.getPromotionDiscount()) / 10000.0);
        int earnedPoints = (int) Math.round(baseEarnedPoints * multiplier);
        if (earnedPoints < 0) earnedPoints = 0;
        
        double currentPoints = customer.getPoints() != null ? customer.getPoints() : 0.0;
        int finalPoints = (int) currentPoints - dto.getUsedPoints() + earnedPoints;
        if (finalPoints < 0) finalPoints = 0;

        String newTier = "ĐỒNG";
        if (finalPoints >= 1500) {
            newTier = "KIM CƯƠNG";
        } else if (finalPoints >= 500) {
            newTier = "VÀNG";
        } else if (finalPoints >= 200) {
            newTier = "BẠC";
        }

        // Add to totalSpent
        double paidForThisOrder = dto.getTotalPrice() - dto.getDiscountAmount() - dto.getPromotionDiscount();
        double currentTotalSpent = customer.getTotalSpent() != null ? customer.getTotalSpent() : 0.0;

        customer.setPoints((double) finalPoints);
        customer.setMembershipTier(newTier);
        customer.setTotalSpent(currentTotalSpent + paidForThisOrder);
        customerRepository.save(customer);
    }

    @Transactional
    public Order createOrder(OrderRequestDTO dto) {
        Order order = new Order();
        order.setCreatedAt(LocalDateTime.now());
        order.setTotalPrice(dto.getTotalPrice());
        order.setPaidAmount(dto.getPaidAmount());
        order.setChangeAmount(dto.getChangeAmount());
        order.setUsedPoints(dto.getUsedPoints());
        order.setDiscountAmount(dto.getDiscountAmount());
        order.setPromotionDiscount(dto.getPromotionDiscount());
        order.setStatus(dto.getStatus());
        order.setPaymentMethod(dto.getPaymentMethod());

        if (dto.getPromotionId() != null) {
            com.example.Pos.Entity.Promotion promo = promotionRepository.findById(dto.getPromotionId()).orElse(null);
            order.setPromotion(promo);
        }

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId()).orElse(null);
            order.setUser(user);
        }

        Customer customer = null;
        if (dto.getCustomerId() != null) {
            customer = customerRepository.findById(dto.getCustomerId()).orElse(null);
            order.setCustomer(customer);
        }

        // Logic Điểm Thưởng (CRM)
        if ("COMPLETED".equalsIgnoreCase(dto.getStatus())) {
            handleLoyaltyPoints(customer, dto);
        }

        Order savedOrder = orderRepository.save(order);

        if (dto.getOrderDetails() != null) {
            for (OrderDetailDTO detailDTO : dto.getOrderDetails()) {
                Product product = productRepository.findById(detailDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + detailDTO.getProductId()));
                
                boolean isImportUnit = Boolean.TRUE.equals(detailDTO.getIsImportUnit());
                int conversionRate = product.getConversionRate() != null && product.getConversionRate() > 0 
                                     ? product.getConversionRate() : 1;
                int realQuantity = isImportUnit ? detailDTO.getQuantity() * conversionRate : detailDTO.getQuantity();

                // Deduct stock only if COMPLETED
                if ("COMPLETED".equalsIgnoreCase(dto.getStatus())) {
                    if (product.getStock() < realQuantity) {
                        throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ tồn kho! Kho còn: " + product.getStock());
                    }
                    product.setStock(product.getStock() - realQuantity);
                    productRepository.save(product);
                }

                OrderDetail detail = new OrderDetail();
                detail.setOrder(savedOrder);
                detail.setProduct(product);
                detail.setQuantity(detailDTO.getQuantity()); // Save exactly what UI showed
                detail.setSellPrice(detailDTO.getSellPrice());
                detail.setIsImportUnit(isImportUnit);
                
                orderDetailRepository.save(detail);
            }
        }
        
        return savedOrder;
    }

    @Transactional
    public Order updateOrder(int id, OrderRequestDTO dto) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + id));

        boolean isNowCompleted = "COMPLETED".equalsIgnoreCase(dto.getStatus());
        boolean wasDraft = "DRAFT".equalsIgnoreCase(order.getStatus());
        
        order.setTotalPrice(dto.getTotalPrice());
        order.setPaidAmount(dto.getPaidAmount());
        order.setChangeAmount(dto.getChangeAmount());
        order.setUsedPoints(dto.getUsedPoints());
        order.setDiscountAmount(dto.getDiscountAmount());
        order.setPromotionDiscount(dto.getPromotionDiscount());
        order.setStatus(dto.getStatus());
        order.setPaymentMethod(dto.getPaymentMethod());

        if (dto.getPromotionId() != null) {
            com.example.Pos.Entity.Promotion promo = promotionRepository.findById(dto.getPromotionId()).orElse(null);
            order.setPromotion(promo);
        } else {
            order.setPromotion(null);
        }

        Customer customer = null;
        if (dto.getCustomerId() != null) {
            customer = customerRepository.findById(dto.getCustomerId()).orElse(null);
            order.setCustomer(customer);
        } else {
            order.setCustomer(null);
        }

        // Logic Điểm Thưởng (CRM) khi thanh toán đơn DRAFT
        if (isNowCompleted && wasDraft) {
            handleLoyaltyPoints(customer, dto);
        }

        Order savedOrder = orderRepository.save(order);

        // Delete old details if any
        if (order.getOrderDetails() != null) {
            orderDetailRepository.deleteAll(order.getOrderDetails());
            order.getOrderDetails().clear();
        }

        // Save new details
        if (dto.getOrderDetails() != null) {
            for (OrderDetailDTO detailDTO : dto.getOrderDetails()) {
                Product product = productRepository.findById(detailDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại: " + detailDTO.getProductId()));
                
                boolean isImportUnit = Boolean.TRUE.equals(detailDTO.getIsImportUnit());
                int conversionRate = product.getConversionRate() != null && product.getConversionRate() > 0 
                                     ? product.getConversionRate() : 1;
                int realQuantity = isImportUnit ? detailDTO.getQuantity() * conversionRate : detailDTO.getQuantity();

                // Only deduct stock if transitioning to COMPLETED
                if (isNowCompleted && wasDraft) {
                    if (product.getStock() < realQuantity) {
                        throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ tồn kho! Kho còn: " + product.getStock());
                    }
                    product.setStock(product.getStock() - realQuantity);
                    productRepository.save(product);
                }

                OrderDetail detail = new OrderDetail();
                detail.setOrder(savedOrder);
                detail.setProduct(product);
                detail.setQuantity(detailDTO.getQuantity()); // Save exactly what UI showed
                detail.setSellPrice(detailDTO.getSellPrice());
                detail.setIsImportUnit(isImportUnit);
                
                orderDetailRepository.save(detail);
            }
        }
        
        return savedOrder;
    }
}
