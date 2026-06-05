package com.example.Pos.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Pos.Entity.InvoiceDetail;
import com.example.Pos.Repository.InvoiceDetailRepository;

@Service
public class InvoiceDetailService {

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Transactional
    public InvoiceDetail addInvoiceDetail(InvoiceDetail invoiceDetail) {
        return invoiceDetailRepository.save(invoiceDetail);
    }

    public List<InvoiceDetail> getAllInvoiceDetails() {
        return invoiceDetailRepository.findAll();
    }

    public Optional<InvoiceDetail> getInvoiceDetailById(int id) {
        return invoiceDetailRepository.findById(id);
    }

    @Transactional
    public InvoiceDetail updateInvoiceDetail(int id, InvoiceDetail invoiceDetailDetails) {
        Optional<InvoiceDetail> existingInvoiceDetail = invoiceDetailRepository.findById(id);
        if (existingInvoiceDetail.isPresent()) {
            InvoiceDetail invoiceDetail = existingInvoiceDetail.get();
            if (invoiceDetailDetails.getQuantity() >= 0) {
                invoiceDetail.setQuantity(invoiceDetailDetails.getQuantity());
            }
            if (invoiceDetailDetails.getUnitPrice() >= 0) {
                invoiceDetail.setUnitPrice(invoiceDetailDetails.getUnitPrice());
            }
            if (invoiceDetailDetails.getTotalPrice() >= 0) {
                invoiceDetail.setTotalPrice(invoiceDetailDetails.getTotalPrice());
            }
            if (invoiceDetailDetails.getProduct() != null) {
                invoiceDetail.setProduct(invoiceDetailDetails.getProduct());
            }
            return invoiceDetailRepository.save(invoiceDetail);
        }
        return null;
    }

    @Transactional
    public boolean deleteInvoiceDetail(int id) {
        if (invoiceDetailRepository.existsById(id)) {
            invoiceDetailRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
