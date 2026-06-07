package com.example.Pos.Service;

import com.example.Pos.DTO.DashboardDTO;
import com.example.Pos.DTO.DashboardKPI;
import com.example.Pos.DTO.TopProductDTO;
import com.example.Pos.Entity.Product;
import com.example.Pos.Repository.OrderDetailRepository;
import com.example.Pos.Repository.OrderRepository;
import com.example.Pos.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.example.Pos.Repository.PurchaseOrderRepository;

@Service
public class DashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    public DashboardDTO getDashboardData(String range) {
        LocalDateTime startDate = getStartDate(range);

        // 1. Calculate KPIs
        Long totalOrders = orderRepository.countCompletedOrders(startDate);
        if (totalOrders == null) totalOrders = 0L;

        Double totalRevenue = orderRepository.sumTotalRevenue(startDate);
        if (totalRevenue == null) totalRevenue = 0.0;

        Double grossProfitBase = orderDetailRepository.calculateGrossProfitBase(startDate);
        if (grossProfitBase == null) grossProfitBase = 0.0;
        
        Double discountAmount = orderRepository.sumDiscountAmount(startDate);
        if (discountAmount == null) discountAmount = 0.0;

        Double promotionDiscount = orderRepository.sumPromotionDiscount(startDate);
        if (promotionDiscount == null) promotionDiscount = 0.0;

        Double grossProfit = grossProfitBase - discountAmount - promotionDiscount;

        Double totalImportCost = purchaseOrderRepository.calculateTotalImportCost(startDate);
        if (totalImportCost == null) totalImportCost = 0.0;

        DashboardKPI kpi = new DashboardKPI(totalOrders, totalRevenue, grossProfit, totalImportCost);

        // 2. Top 10 Products
        List<TopProductDTO> topProducts = orderDetailRepository.findTopSellingProducts(startDate, PageRequest.of(0, 10));

        // 3. Low Stock Alerts
        List<Product> lowStockAlerts = productRepository.findLowStockProducts();

        return new DashboardDTO(kpi, topProducts, lowStockAlerts);
    }

    private LocalDateTime getStartDate(String range) {
        LocalDate today = LocalDate.now();
        if ("week".equalsIgnoreCase(range)) {
            return today.with(DayOfWeek.MONDAY).atStartOfDay();
        } else if ("month".equalsIgnoreCase(range)) {
            return today.withDayOfMonth(1).atStartOfDay();
        }
        // Default to "today"
        return today.atStartOfDay();
    }
}
