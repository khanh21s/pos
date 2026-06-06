package com.example.Pos.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Pos.Entity.Product;
import com.example.Pos.Repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public Product addProduct(Product product) {
        // Enforce business rule: new products always start with 0 stock
        product.setStock(0);
        if (product.getMinStock() == null || product.getMinStock() == 0) {
            product.setMinStock(5);
        }
        // Auto-generate SKU and Barcode if empty
        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            product.setSku("SP-" + System.currentTimeMillis());
        }
        if (product.getBarcode() == null || product.getBarcode().trim().isEmpty()) {
            product.setBarcode("893" + (int)(Math.random() * 100000000));
        }

        product.setCreatedAt(java.time.LocalDateTime.now());
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(int id) {
        return productRepository.findById(id);
    }

    @Transactional
    public Product updateProduct(int id, Product productDetails) {
        Optional<Product> existingProduct = productRepository.findById(id);
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            if (productDetails.getName() != null) {
                product.setName(productDetails.getName());
            }
            if (productDetails.getSku() != null) {
                product.setSku(productDetails.getSku());
            }
            if (productDetails.getBarcode() != null) {
                product.setBarcode(productDetails.getBarcode());
            }
            if (productDetails.getImage() != null) {
                product.setImage(productDetails.getImage());
            }
            if (productDetails.getSellPrice() != null && productDetails.getSellPrice() > 0) {
                product.setSellPrice(productDetails.getSellPrice());
            }
            if (productDetails.getImportPrice() != null && productDetails.getImportPrice() > 0) {
                product.setImportPrice(productDetails.getImportPrice());
            }
            // Admin should not update stock directly here, but if needed for correction we keep it
            if (productDetails.getStock() != null && productDetails.getStock() >= 0) {
                product.setStock(productDetails.getStock());
            }
            if (productDetails.getMinStock() != null && productDetails.getMinStock() >= 0) {
                product.setMinStock(productDetails.getMinStock());
            }
            if (productDetails.getCategory() != null) {
                product.setCategory(productDetails.getCategory());
            }
            if (productDetails.getImportUnit() != null) {
                product.setImportUnit(productDetails.getImportUnit());
            }
            if (productDetails.getSellUnit() != null) {
                product.setSellUnit(productDetails.getSellUnit());
            }
            if (productDetails.getConversionRate() != null && productDetails.getConversionRate() > 0) {
                product.setConversionRate(productDetails.getConversionRate());
            }
            if (productDetails.getIsActive() != null) {
                product.setIsActive(productDetails.getIsActive());
            }
            if (productDetails.getDescription() != null) {
                product.setDescription(productDetails.getDescription());
            }
            return productRepository.save(product);
        }
        return null;
    }

    @Transactional
    public boolean deleteProduct(int id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
