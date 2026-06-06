package com.example.Pos.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Pos.Entity.Supplier;
import com.example.Pos.Repository.SupplierRepository;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Transactional
    public Supplier addSupplier(Supplier supplier) {
        supplier.setCreatedAt(java.time.LocalDateTime.now());
        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findByDeletedAtIsNull();
    }

    public Optional<Supplier> getSupplierById(int id) {
        return supplierRepository.findById(id).filter(s -> s.getDeletedAt() == null);
    }

    @Transactional
    public Supplier updateSupplier(int id, Supplier supplierDetails) {
        Optional<Supplier> existingSupplier = supplierRepository.findById(id);
        if (existingSupplier.isPresent()) {
            Supplier supplier = existingSupplier.get();
            if (supplier.getDeletedAt() != null) return null; // Cannot update deleted supplier
            
            if (supplierDetails.getName() != null) {
                supplier.setName(supplierDetails.getName());
            }
            if (supplierDetails.getPhone() != null) {
                supplier.setPhone(supplierDetails.getPhone());
            }
            if (supplierDetails.getAddress() != null) {
                supplier.setAddress(supplierDetails.getAddress());
            }
            if (supplierDetails.getNote() != null) {
                supplier.setNote(supplierDetails.getNote());
            }
            supplier.setUpdatedAt(java.time.LocalDateTime.now());
            return supplierRepository.save(supplier);
        }
        return null;
    }

    @Transactional
    public boolean deleteSupplier(int id) {
        Optional<Supplier> existingSupplier = supplierRepository.findById(id);
        if (existingSupplier.isPresent()) {
            Supplier supplier = existingSupplier.get();
            if (supplier.getDeletedAt() == null) {
                supplier.setDeletedAt(java.time.LocalDateTime.now());
                supplierRepository.save(supplier);
                return true;
            }
        }
        return false;
    }
}
