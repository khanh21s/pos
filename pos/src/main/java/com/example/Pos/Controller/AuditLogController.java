package com.example.Pos.Controller;

import com.example.Pos.Entity.AuditLog;
import com.example.Pos.Repository.AuditLogRepository;
import com.example.Pos.Security.RequireRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @RequireRole("ADMIN")
    @GetMapping
    public ResponseEntity<List<AuditLog>> getAuditLogs(@RequestParam(required = false) Integer userId) {
        try {
            List<AuditLog> logs;
            if (userId != null) {
                logs = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
            } else {
                logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
            }
            return new ResponseEntity<>(logs, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
