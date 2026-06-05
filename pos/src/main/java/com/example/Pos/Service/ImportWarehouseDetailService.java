package com.example.Pos.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Pos.Entity.ImportWarehouseDetail;
import com.example.Pos.Repository.ImportWarehouseDetailRepository;

@Service
public class ImportWarehouseDetailService {

    @Autowired
    private ImportWarehouseDetailRepository importWarehouseDetailRepository;

    @Transactional
    public ImportWarehouseDetail addImportWarehouseDetail(ImportWarehouseDetail importWarehouseDetail) {
        return importWarehouseDetailRepository.save(importWarehouseDetail);
    }

    public List<ImportWarehouseDetail> getAllImportWarehouseDetails() {
        return importWarehouseDetailRepository.findAll();
    }

    public Optional<ImportWarehouseDetail> getImportWarehouseDetailById(int id) {
        return importWarehouseDetailRepository.findById(id);
    }

    @Transactional
    public ImportWarehouseDetail updateImportWarehouseDetail(int id, ImportWarehouseDetail importWarehouseDetailDetails) {
        Optional<ImportWarehouseDetail> existingImportWarehouseDetail = importWarehouseDetailRepository.findById(id);
        if (existingImportWarehouseDetail.isPresent()) {
            ImportWarehouseDetail importWarehouseDetail = existingImportWarehouseDetail.get();
            if (importWarehouseDetailDetails.getQuantity() >= 0) {
                importWarehouseDetail.setQuantity(importWarehouseDetailDetails.getQuantity());
            }
            if (importWarehouseDetailDetails.getCostPrice() >= 0) {
                importWarehouseDetail.setCostPrice(importWarehouseDetailDetails.getCostPrice());
            }
            if (importWarehouseDetailDetails.getTotalPrice() >= 0) {
                importWarehouseDetail.setTotalPrice(importWarehouseDetailDetails.getTotalPrice());
            }
            if (importWarehouseDetailDetails.getUnit() != null) {
                importWarehouseDetail.setUnit(importWarehouseDetailDetails.getUnit());
            }
            if (importWarehouseDetailDetails.getProduct() != null) {
                importWarehouseDetail.setProduct(importWarehouseDetailDetails.getProduct());
            }
            return importWarehouseDetailRepository.save(importWarehouseDetail);
        }
        return null;
    }

    @Transactional
    public boolean deleteImportWarehouseDetail(int id) {
        if (importWarehouseDetailRepository.existsById(id)) {
            importWarehouseDetailRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
