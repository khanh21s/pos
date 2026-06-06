package com.example.Pos.Controller;

import com.example.Pos.Security.RequireRole;
import com.example.Pos.DTO.DashboardDTO;
import com.example.Pos.Service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @RequireRole("ADMIN")
    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboardData(@RequestParam(defaultValue = "today") String range) {
        return ResponseEntity.ok(dashboardService.getDashboardData(range));
    }

    @GetMapping("/public")
    public ResponseEntity<DashboardDTO> getDashboardDataPublic(@RequestParam(defaultValue = "today") String range) {
        return ResponseEntity.ok(dashboardService.getDashboardData(range));
    }
}
