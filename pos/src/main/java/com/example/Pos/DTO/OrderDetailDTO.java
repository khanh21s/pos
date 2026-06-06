package com.example.Pos.DTO;
import lombok.Data;
@Data
public class OrderDetailDTO {
    private int productId;
    private int quantity;
    private double sellPrice;
    private Boolean isImportUnit;
}
