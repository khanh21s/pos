package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Pos.Entity.PurchaseOrder;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {

    @Query("SELECT SUM(po.totalCost) FROM PurchaseOrder po WHERE po.status = 'COMPLETED' AND po.createdAt >= :startDate")
    Double calculateTotalImportCost(@Param("startDate") LocalDateTime startDate);
}
