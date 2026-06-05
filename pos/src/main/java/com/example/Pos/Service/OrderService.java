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

    public List<Order> getOrdersByStatus(String status) {
        if (status == null) {
            return orderRepository.findAll();
        }
        return orderRepository.findByStatusOrderByIdDesc(status);
    }

    private void handleLoyaltyPoints(Customer customer, OrderRequestDTO dto) {
        if (customer == null) return;
        
        double multiplier = 1.0;
        if ("KIM CƯƠNG".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 2.0;
        else if ("VÀNG".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 1.5;
        else if ("BẠC".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 1.2;

        int baseEarnedPoints = (int) Math.floor((dto.getTotalPrice() - dto.getDiscountAmount()) / 10000.0);
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

        customer.setPoints((double) finalPoints);
        customer.setMembershipTier(newTier);
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
        order.setStatus(dto.getStatus());
        order.setPaymentMethod(dto.getPaymentMethod());

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
                
                // Deduct stock only if COMPLETED
                if ("COMPLETED".equalsIgnoreCase(dto.getStatus())) {
                    if (product.getStock() < detailDTO.getQuantity()) {
                        throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ tồn kho! Kho còn: " + product.getStock());
                    }
                    product.setStock(product.getStock() - detailDTO.getQuantity());
                    productRepository.save(product);
                }

                OrderDetail detail = new OrderDetail();
                detail.setOrder(savedOrder);
                detail.setProduct(product);
                detail.setQuantity(detailDTO.getQuantity());
                detail.setSellPrice(detailDTO.getSellPrice());
                
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
        order.setStatus(dto.getStatus());
        order.setPaymentMethod(dto.getPaymentMethod());

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
                
                // Only deduct stock if transitioning to COMPLETED
                if (isNowCompleted && wasDraft) {
                    if (product.getStock() < detailDTO.getQuantity()) {
                        throw new RuntimeException("Sản phẩm " + product.getName() + " không đủ tồn kho! Kho còn: " + product.getStock());
                    }
                    product.setStock(product.getStock() - detailDTO.getQuantity());
                    productRepository.save(product);
                }

                OrderDetail detail = new OrderDetail();
                detail.setOrder(savedOrder);
                detail.setProduct(product);
                detail.setQuantity(detailDTO.getQuantity());
                detail.setSellPrice(detailDTO.getSellPrice());
                
                orderDetailRepository.save(detail);
            }
        }
        
        return savedOrder;
    }
}
