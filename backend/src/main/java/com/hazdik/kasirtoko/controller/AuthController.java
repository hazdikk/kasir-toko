package com.hazdik.kasirtoko.controller;

import com.hazdik.kasirtoko.model.dto.AuthUserResponse;
import com.hazdik.kasirtoko.model.dto.CsrfResponse;
import com.hazdik.kasirtoko.model.dto.LoginRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final SecurityContextRepository securityContextRepository;

  @PostMapping("/login")
  public AuthUserResponse login(
      @Valid @RequestBody LoginRequest request,
      HttpServletRequest httpRequest,
      HttpServletResponse httpResponse) {
    Authentication authentication =
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password()));
    SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
    securityContext.setAuthentication(authentication);
    SecurityContextHolder.setContext(securityContext);
    httpRequest.getSession(true);
    httpRequest.changeSessionId();
    securityContextRepository.saveContext(securityContext, httpRequest, httpResponse);
    return new AuthUserResponse(authentication.getName());
  }

  @PostMapping("/logout")
  public void logout(
      Authentication authentication,
      HttpServletRequest httpRequest,
      HttpServletResponse httpResponse) {
    new SecurityContextLogoutHandler().logout(httpRequest, httpResponse, authentication);
  }

  @GetMapping("/me")
  public AuthUserResponse me(Authentication authentication) {
    return new AuthUserResponse(authentication.getName());
  }

  @GetMapping("/csrf")
  public CsrfResponse csrf(CsrfToken csrfToken) {
    return new CsrfResponse(
        csrfToken.getHeaderName(), csrfToken.getParameterName(), csrfToken.getToken());
  }
}
