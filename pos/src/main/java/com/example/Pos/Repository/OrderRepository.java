package com.example.Pos.Repository;
import com.example.Pos.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByStatusOrderByIdDesc(String status);
}
