package com.example.BookApplication.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BookApplication.Entity.Employee;
import com.example.BookApplication.Repository.EmployeeRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Transactional
    public Employee addEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(int id) {
        return employeeRepository.findById(id);
    }

    @Transactional
    public Employee updateEmployee(int id, Employee employeeDetails) {
        Optional<Employee> existingEmployee = employeeRepository.findById(id);
        if (existingEmployee.isPresent()) {
            Employee employee = existingEmployee.get();
            if (employeeDetails.getName() != null) {
                employee.setName(employeeDetails.getName());
            }
            if (employeeDetails.getEmail() != null) {
                employee.setEmail(employeeDetails.getEmail());
            }
            if (employeeDetails.getPhone() != null) {
                employee.setPhone(employeeDetails.getPhone());
            }
            if (employeeDetails.getRole() != null) {
                employee.setRole(employeeDetails.getRole());
            }
            if (employeeDetails.getStatus() != null) {
                employee.setStatus(employeeDetails.getStatus());
            }
            return employeeRepository.save(employee);
        }
        return null;
    }

    @Transactional
    public boolean deleteEmployee(int id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
