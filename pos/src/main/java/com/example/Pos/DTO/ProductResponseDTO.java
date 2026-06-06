package com.example.Pos.DTO;

public class ProductResponseDTO {
    private int id;
    private String name;
    private String barcode;
    private String sku;
    private String image;
    private double sellPrice;
    
    // Add category info if needed for POS displaying
    private String categoryName;
    private Integer categoryId;
    
    private String importUnit;
    private String sellUnit;
    private Integer conversionRate;

    public ProductResponseDTO(int id, String name, String barcode, String sku, String image, double sellPrice, String categoryName, Integer categoryId, String importUnit, String sellUnit, Integer conversionRate) {
        this.id = id;
        this.name = name;
        this.barcode = barcode;
        this.sku = sku;
        this.image = image;
        this.sellPrice = sellPrice;
        this.categoryName = categoryName;
        this.categoryId = categoryId;
        this.importUnit = importUnit;
        this.sellUnit = sellUnit;
        this.conversionRate = conversionRate;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public double getSellPrice() { return sellPrice; }
    public void setSellPrice(double sellPrice) { this.sellPrice = sellPrice; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public String getImportUnit() { return importUnit; }
    public void setImportUnit(String importUnit) { this.importUnit = importUnit; }
    public String getSellUnit() { return sellUnit; }
    public void setSellUnit(String sellUnit) { this.sellUnit = sellUnit; }
    public Integer getConversionRate() { return conversionRate; }
    public void setConversionRate(Integer conversionRate) { this.conversionRate = conversionRate; }
}
