package com.example.Pos.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Pos.Entity.ImportWarehouse;
import com.example.Pos.Repository.ImportWarehouseRepository;

@Service
public class ImportWarehouseService {

    @Autowired
    private ImportWarehouseRepository importWarehouseRepository;

    @Transactional
    public ImportWarehouse addImportWarehouse(ImportWarehouse importWarehouse) {
        return importWarehouseRepository.save(importWarehouse);
    }

    public List<ImportWarehouse> getAllImportWarehouses() {
        return importWarehouseRepository.findAll();
    }

    public Optional<ImportWarehouse> getImportWarehouseById(int id) {
        return importWarehouseRepository.findById(id);
    }

    @Transactional
    public ImportWarehouse updateImportWarehouse(int id, ImportWarehouse importWarehouseDetails) {
        Optional<ImportWarehouse> existingImportWarehouse = importWarehouseRepository.findById(id);
        if (existingImportWarehouse.isPresent()) {
            ImportWarehouse importWarehouse = existingImportWarehouse.get();
            if (importWarehouseDetails.getImportNumber() != null) {
                importWarehouse.setImportNumber(importWarehouseDetails.getImportNumber());
            }
            if (importWarehouseDetails.getTotalAmount() >= 0) {
                importWarehouse.setTotalAmount(importWarehouseDetails.getTotalAmount());
            }
            if (importWarehouseDetails.getStatus() != null) {
                importWarehouse.setStatus(importWarehouseDetails.getStatus());
            }
            if (importWarehouseDetails.getSupplier() != null) {
                importWarehouse.setSupplier(importWarehouseDetails.getSupplier());
            }
            if (importWarehouseDetails.getEmployee() != null) {
                importWarehouse.setEmployee(importWarehouseDetails.getEmployee());
            }
            return importWarehouseRepository.save(importWarehouse);
        }
        return null;
    }

    @Transactional
    public boolean deleteImportWarehouse(int id) {
        if (importWarehouseRepository.existsById(id)) {
            importWarehouseRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
