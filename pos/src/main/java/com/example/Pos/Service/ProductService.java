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
            if (productDetails.getSellPrice() > 0) {
                product.setSellPrice(productDetails.getSellPrice());
            }
            if (productDetails.getImportPrice() > 0) {
                product.setImportPrice(productDetails.getImportPrice());
            }
            if (productDetails.getStock() >= 0) {
                product.setStock(productDetails.getStock());
            }
            if (productDetails.getMinStock() >= 0) {
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
            if (productDetails.getConversionRate() > 0) {
                product.setConversionRate(productDetails.getConversionRate());
            }
            product.setActive(productDetails.isActive());
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
