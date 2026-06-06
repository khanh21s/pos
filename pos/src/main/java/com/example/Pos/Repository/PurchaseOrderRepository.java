package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Pos.Entity.PurchaseOrder;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {
}
