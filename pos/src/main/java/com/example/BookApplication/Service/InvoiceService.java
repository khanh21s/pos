package com.example.BookApplication.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BookApplication.Entity.Invoice;
import com.example.BookApplication.Repository.InvoiceRepository;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Transactional
    public Invoice addInvoice(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Optional<Invoice> getInvoiceById(int id) {
        return invoiceRepository.findById(id);
    }

    @Transactional
    public Invoice updateInvoice(int id, Invoice invoiceDetails) {
        Optional<Invoice> existingInvoice = invoiceRepository.findById(id);
        if (existingInvoice.isPresent()) {
            Invoice invoice = existingInvoice.get();
            if (invoiceDetails.getInvoiceNumber() != null) {
                invoice.setInvoiceNumber(invoiceDetails.getInvoiceNumber());
            }
            if (invoiceDetails.getSubtotal() >= 0) {
                invoice.setSubtotal(invoiceDetails.getSubtotal());
            }
            if (invoiceDetails.getDiscountAmount() >= 0) {
                invoice.setDiscountAmount(invoiceDetails.getDiscountAmount());
            }
            if (invoiceDetails.getTotalAmount() >= 0) {
                invoice.setTotalAmount(invoiceDetails.getTotalAmount());
            }
            if (invoiceDetails.getPaymentMethod() != null) {
                invoice.setPaymentMethod(invoiceDetails.getPaymentMethod());
            }
            if (invoiceDetails.getStatus() != null) {
                invoice.setStatus(invoiceDetails.getStatus());
            }
            if (invoiceDetails.getCustomer() != null) {
                invoice.setCustomer(invoiceDetails.getCustomer());
            }
            if (invoiceDetails.getEmployee() != null) {
                invoice.setEmployee(invoiceDetails.getEmployee());
            }
            return invoiceRepository.save(invoice);
        }
        return null;
    }

    @Transactional
    public boolean deleteInvoice(int id) {
        if (invoiceRepository.existsById(id)) {
            invoiceRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
