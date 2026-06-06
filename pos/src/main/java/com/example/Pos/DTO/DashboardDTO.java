package com.example.Pos.DTO;

import com.example.Pos.Entity.Product;
import java.util.List;

public class DashboardDTO {
    private DashboardKPI kpi;
    private List<TopProductDTO> topProducts;
    private List<Product> lowStockAlerts;

    public DashboardDTO(DashboardKPI kpi, List<TopProductDTO> topProducts, List<Product> lowStockAlerts) {
        this.kpi = kpi;
        this.topProducts = topProducts;
        this.lowStockAlerts = lowStockAlerts;
    }

    public DashboardKPI getKpi() { return kpi; }
    public void setKpi(DashboardKPI kpi) { this.kpi = kpi; }
    public List<TopProductDTO> getTopProducts() { return topProducts; }
    public void setTopProducts(List<TopProductDTO> topProducts) { this.topProducts = topProducts; }
    public List<Product> getLowStockAlerts() { return lowStockAlerts; }
    public void setLowStockAlerts(List<Product> lowStockAlerts) { this.lowStockAlerts = lowStockAlerts; }
}
