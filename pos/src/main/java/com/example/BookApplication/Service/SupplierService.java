package com.example.BookApplication.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BookApplication.Entity.Supplier;
import com.example.BookApplication.Repository.SupplierRepository;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Transactional
    public Supplier addSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Optional<Supplier> getSupplierById(int id) {
        return supplierRepository.findById(id);
    }

    @Transactional
    public Supplier updateSupplier(int id, Supplier supplierDetails) {
        Optional<Supplier> existingSupplier = supplierRepository.findById(id);
        if (existingSupplier.isPresent()) {
            Supplier supplier = existingSupplier.get();
            if (supplierDetails.getName() != null) {
                supplier.setName(supplierDetails.getName());
            }
            if (supplierDetails.getContactPerson() != null) {
                supplier.setContactPerson(supplierDetails.getContactPerson());
            }
            if (supplierDetails.getPhone() != null) {
                supplier.setPhone(supplierDetails.getPhone());
            }
            if (supplierDetails.getEmail() != null) {
                supplier.setEmail(supplierDetails.getEmail());
            }
            if (supplierDetails.getAddress() != null) {
                supplier.setAddress(supplierDetails.getAddress());
            }
            if (supplierDetails.getBankAccount() != null) {
                supplier.setBankAccount(supplierDetails.getBankAccount());
            }
            return supplierRepository.save(supplier);
        }
        return null;
    }

    @Transactional
    public boolean deleteSupplier(int id) {
        if (supplierRepository.existsById(id)) {
            supplierRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
