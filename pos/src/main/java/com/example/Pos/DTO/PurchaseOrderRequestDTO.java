package com.example.Pos.DTO;

import java.util.List;
import lombok.Data;

@Data
public class PurchaseOrderRequestDTO {
    private Integer supplierId;
    private Double totalCost;
    private List<PurchaseOrderDetailRequestDTO> details;
}
