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

    @Autowired
    private com.example.Pos.Repository.OrderRepository orderRepository;

    @Transactional
    public void syncTotalSpent() {
        List<Customer> customers = customerRepository.findAll();
        for (Customer customer : customers) {
            List<com.example.Pos.Entity.Order> completedOrders = orderRepository.findByCustomerAndStatus(customer, "COMPLETED");
            double totalSpent = 0.0;
            double totalPoints = 0.0;

            for (com.example.Pos.Entity.Order order : completedOrders) {
                double discount = order.getDiscountAmount(); 
                double promo = order.getPromotionDiscount(); 
                double finalPrice = order.getTotalPrice() - discount - promo;
                if (finalPrice > 0) {
                    totalSpent += finalPrice;
                    
                    // Re-calculate points for this order
                    // Since membership tier changes dynamically, to be 100% accurate we'd need to simulate history.
                    // For a simple retroactive sync, let's just assume BẠC for multiplier if points > 200, etc.
                    // But actually we can just do 1 point per 10k for simplicity, or we can just apply current tier.
                    double multiplier = 1.0;
                    if ("KIM CƯƠNG".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 2.0;
                    else if ("VÀNG".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 1.5;
                    else if ("BẠC".equalsIgnoreCase(customer.getMembershipTier())) multiplier = 1.2;

                    int baseEarnedPoints = (int) Math.floor((order.getTotalPrice() - discount) / 10000.0);
                    int earnedPoints = (int) Math.round(baseEarnedPoints * multiplier);
                    if (earnedPoints < 0) earnedPoints = 0;
                    
                    totalPoints += earnedPoints;
                }
                totalPoints -= order.getUsedPoints(); // subtract used points
            }
            if (totalPoints < 0) totalPoints = 0;

            String newTier = "ĐỒNG";
            if (totalPoints >= 1500) newTier = "KIM CƯƠNG";
            else if (totalPoints >= 500) newTier = "VÀNG";
            else if (totalPoints >= 200) newTier = "BẠC";

            customer.setTotalSpent(totalSpent);
            customer.setPoints(totalPoints);
            customer.setMembershipTier(newTier);
            customerRepository.save(customer);
        }
    }

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
            if (customerDetails.getPhone() != null && !customerDetails.getPhone().equals(customer.getPhone())) {
                // Check unique phone
                Customer existPhone = customerRepository.findByPhone(customerDetails.getPhone());
                if (existPhone != null && existPhone.getId() != id) {
                    throw new RuntimeException("Số điện thoại này đã được sử dụng bởi khách hàng khác!");
                }
                customer.setPhone(customerDetails.getPhone());
            }
            if (customerDetails.getEmail() != null) {
                customer.setEmail(customerDetails.getEmail());
            }
            if (customerDetails.getAddress() != null) {
                customer.setAddress(customerDetails.getAddress());
            }
            // Không cho phép sửa points và membershipTier qua API này để bảo mật CRM.
            // Hai trường này chỉ được update tự động qua luồng Order/Refund.
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
