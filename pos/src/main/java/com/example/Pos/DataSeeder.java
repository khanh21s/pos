package com.example.Pos;

import com.example.Pos.Entity.User;
import com.example.Pos.Repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Database đang trống. Tiến hành tạo tài khoản mặc định...");
            
            // Create Admin
            User admin = new User();
            admin.setName("Quản trị viên");
            admin.setUsername("admin");
            admin.setPassword(BCrypt.hashpw("admin123", BCrypt.gensalt()));
            admin.setRole("ADMIN");
            admin.setIsActive(true);
            userRepository.save(admin);

            // Create Staff
            User staff = new User();
            staff.setName("Nhân viên bán hàng");
            staff.setUsername("staff");
            staff.setPassword(BCrypt.hashpw("staff123", BCrypt.gensalt()));
            staff.setRole("STAFF");
            staff.setIsActive(true);
            userRepository.save(staff);

            System.out.println("Đã tạo thành công 2 tài khoản:");
            System.out.println("- Admin: admin / admin123");
            System.out.println("- Staff: staff / staff123");
        }
    }
}
