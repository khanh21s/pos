package com.example.BookApplication.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BookApplication.Entity.Product;
import com.example.BookApplication.Repository.ProductRepository;

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
            if (productDetails.getPrice() > 0) {
                product.setPrice(productDetails.getPrice());
            }
            if (productDetails.getCostPrice() > 0) {
                product.setCostPrice(productDetails.getCostPrice());
            }
            if (productDetails.getQuantity() >= 0) {
                product.setQuantity(productDetails.getQuantity());
            }
            if (productDetails.getCategory() != null) {
                product.setCategory(productDetails.getCategory());
            }
            if (productDetails.getUnit() != null) {
                product.setUnit(productDetails.getUnit());
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
