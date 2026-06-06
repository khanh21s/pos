package com.example.Pos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Pos.Entity.InventoryTransaction;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Integer> {
}
