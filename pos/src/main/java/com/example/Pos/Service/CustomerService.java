package com.example.Pos.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Pos.Entity.Customer;
import com.example.Pos.Repository.CustomerRepository;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Transactional
    public Customer addCustomer(Customer customer) {
        if (customer.getPoints() == null) customer.setPoints(0.0);
        if (customer.getTotalSpent() == null) customer.setTotalSpent(0.0);
        if (customer.getMembershipTier() == null) customer.setMembershipTier("ĐỒNG");
        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(int id) {
        return customerRepository.findById(id);
    }

    @Transactional
    public Customer updateCustomer(int id, Customer customerDetails) {
        Optional<Customer> existingCustomer = customerRepository.findById(id);
        if (existingCustomer.isPresent()) {
            Customer customer = existingCustomer.get();
            if (customerDetails.getName() != null) {
                customer.setName(customerDetails.getName());
            }
            if (customerDetails.getPhone() != null) {
                customer.setPhone(customerDetails.getPhone());
            }
            if (customerDetails.getEmail() != null) {
                customer.setEmail(customerDetails.getEmail());
            }
            if (customerDetails.getAddress() != null) {
                customer.setAddress(customerDetails.getAddress());
            }
            if (customerDetails.getMembershipTier() != null) {
                customer.setMembershipTier(customerDetails.getMembershipTier());
            }
            if (customerDetails.getPoints() != null && customerDetails.getPoints() >= 0) {
                customer.setPoints(customerDetails.getPoints());
            }
            if (customerDetails.getTotalSpent() != null && customerDetails.getTotalSpent() >= 0) {
                customer.setTotalSpent(customerDetails.getTotalSpent());
            }
            return customerRepository.save(customer);
        }
        return null;
    }

    @Transactional
    public boolean deleteCustomer(int id) {
        if (customerRepository.existsById(id)) {
            customerRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
