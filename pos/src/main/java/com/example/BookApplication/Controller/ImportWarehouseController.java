package com.example.BookApplication.Controller;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.BookApplication.Entity.ImportWarehouse;
import com.example.BookApplication.Service.ImportWarehouseService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/import-warehouses")
public class ImportWarehouseController {

    @Autowired
    private ImportWarehouseService importWarehouseService;

    @PostMapping
    public ResponseEntity<ImportWarehouse> addImportWarehouse(@RequestBody ImportWarehouse importWarehouse) {
        try {
            ImportWarehouse savedImportWarehouse = importWarehouseService.addImportWarehouse(importWarehouse);
            return new ResponseEntity<>(savedImportWarehouse, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ImportWarehouse>> getAllImportWarehouses() {
        try {
            List<ImportWarehouse> importWarehouses = importWarehouseService.getAllImportWarehouses();
            if (importWarehouses.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(importWarehouses, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImportWarehouse> getImportWarehouseById(@PathVariable int id) {
        try {
            Optional<ImportWarehouse> importWarehouse = importWarehouseService.getImportWarehouseById(id);
            if (importWarehouse.isPresent()) {
                return new ResponseEntity<>(importWarehouse.get(), HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImportWarehouse> updateImportWarehouse(@PathVariable int id, @RequestBody ImportWarehouse importWarehouse) {
        try {
            ImportWarehouse updatedImportWarehouse = importWarehouseService.updateImportWarehouse(id, importWarehouse);
            if (updatedImportWarehouse != null) {
                return new ResponseEntity<>(updatedImportWarehouse, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImportWarehouse(@PathVariable int id) {
        try {
            if (importWarehouseService.deleteImportWarehouse(id)) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
