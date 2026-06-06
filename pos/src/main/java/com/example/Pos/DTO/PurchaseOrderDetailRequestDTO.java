package com.example.Pos.DTO;

import lombok.Data;

@Data
public class PurchaseOrderDetailRequestDTO {
    private Integer productId;
    private Integer importQuantity;
    private Double importPrice;
    private Double subtotal;
    private Boolean isImportUnit;
}
