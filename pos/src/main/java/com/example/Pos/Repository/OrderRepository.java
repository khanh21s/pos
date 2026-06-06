package com.example.Pos.Repository;
import com.example.Pos.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByStatusOrderByIdDesc(String status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate")
    Long countCompletedOrders(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate")
    Double sumTotalRevenue(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.discountAmount) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate")
    Double sumDiscountAmount(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);
}
