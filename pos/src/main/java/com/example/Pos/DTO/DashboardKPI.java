package com.example.Pos.DTO;

public class DashboardKPI {
    private Long totalOrders;
    private Double totalRevenue;
    private Double grossProfit;
    private Double totalImportCost;

    public DashboardKPI() {}

    public DashboardKPI(Long totalOrders, Double totalRevenue, Double grossProfit, Double totalImportCost) {
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.grossProfit = grossProfit;
        this.totalImportCost = totalImportCost;
    }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    public Double getGrossProfit() { return grossProfit; }
    public void setGrossProfit(Double grossProfit) { this.grossProfit = grossProfit; }
    public Double getTotalImportCost() { return totalImportCost; }
    public void setTotalImportCost(Double totalImportCost) { this.totalImportCost = totalImportCost; }
}
