package com.example.Pos.Repository;
import com.example.Pos.Entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    @org.springframework.data.jpa.repository.Query("SELECT SUM((od.sellPrice - (CASE WHEN od.isImportUnit = true THEN (p.importPrice * p.conversionRate) ELSE p.importPrice END)) * od.quantity) " +
       "FROM OrderDetail od JOIN od.order o JOIN od.product p " +
       "WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate")
    Double calculateGrossProfitBase(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT new com.example.Pos.DTO.TopProductDTO(p.id, p.name, SUM(CAST(od.quantity * (CASE WHEN od.isImportUnit = true THEN p.conversionRate ELSE 1 END) AS long))) " +
       "FROM OrderDetail od JOIN od.order o JOIN od.product p " +
       "WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate " +
       "GROUP BY p.id, p.name " +
       "ORDER BY SUM(od.quantity * (CASE WHEN od.isImportUnit = true THEN p.conversionRate ELSE 1 END)) DESC")
    java.util.List<com.example.Pos.DTO.TopProductDTO> findTopSellingProducts(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate, org.springframework.data.domain.Pageable pageable);
}
