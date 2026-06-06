package com.example.Pos.DTO;

public class TopProductDTO {
    private Integer id;
    private String name;
    private String image;
    private Long totalSold;

    public TopProductDTO(Integer id, String name, Long totalSold) {
        this.id = id;
        this.name = name;
        this.image = "https://via.placeholder.com/40"; // Default placeholder
        this.totalSold = totalSold;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public Long getTotalSold() { return totalSold; }
    public void setTotalSold(Long totalSold) { this.totalSold = totalSold; }
}
