package com.example.Pos.Service;

import java.util.List;
import java.util.Optional;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.Pos.Entity.User;
import com.example.Pos.Repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public User addUser(User user) {
        // Hash password before saving
        String hashed = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashed);
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User updateUser(Integer id, User userDetails) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (userDetails.getName() != null) user.setName(userDetails.getName());
            if (userDetails.getUsername() != null) user.setUsername(userDetails.getUsername());
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(BCrypt.hashpw(userDetails.getPassword(), BCrypt.gensalt()));
            }
            if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
            if (userDetails.getIsActive() != null) user.setIsActive(userDetails.getIsActive());
            return userRepository.save(user);
        }
        return null;
    }

    @Transactional
    public boolean deleteUser(Integer id) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setIsActive(false);
            user.setDeletedAt(java.time.LocalDateTime.now());
            userRepository.save(user);
            return true;
        }
        return false;
    }
}
