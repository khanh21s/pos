package com.example.Pos.DTO;
import java.util.List;
import lombok.Data;
@Data
public class OrderRequestDTO {
    private Integer userId;
    private Integer customerId;
    private double totalPrice;
    private double paidAmount;
    private double changeAmount;
    private int usedPoints;
    private double discountAmount;
    private String status;
    private String paymentMethod;
    private List<OrderDetailDTO> orderDetails;
}
