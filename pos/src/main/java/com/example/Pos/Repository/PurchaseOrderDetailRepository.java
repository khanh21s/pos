package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Pos.Entity.PurchaseOrderDetail;

public interface PurchaseOrderDetailRepository extends JpaRepository<PurchaseOrderDetail, Integer> {
}
