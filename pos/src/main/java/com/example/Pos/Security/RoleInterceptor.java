package com.example.Pos.Security;

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RoleInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Preflight CORS checks can pass
        if (request.getMethod().equals("OPTIONS")) return true;

        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid Authorization header");
            return false;
        }

        String token = authHeader.substring(7);
        DecodedJWT decodedJWT = jwtUtil.verifyToken(token);
        
        if (decodedJWT == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Token");
            return false;
        }

        // Store user info in request for later use (e.g. Audit logs)
        request.setAttribute("userId", decodedJWT.getClaim("id").asInt());
        request.setAttribute("username", decodedJWT.getSubject());
        request.setAttribute("role", decodedJWT.getClaim("role").asString());

        if (requireRole != null) {
            String requiredRole = requireRole.value();
            String userRole = decodedJWT.getClaim("role").asString();
            
            // "ADMIN" has full access, so if required role is STAFF but user is ADMIN, it's allowed.
            if ("ADMIN".equals(requiredRole) && !"ADMIN".equals(userRole)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied: Requires ADMIN role");
                return false;
            }
        }

        return true;
    }
}
