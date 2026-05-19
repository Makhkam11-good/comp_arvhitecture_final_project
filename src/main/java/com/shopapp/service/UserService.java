package com.shopapp.service;

import com.shopapp.dto.UserProfileDTO;
import com.shopapp.exception.ResourceNotFoundException;
import com.shopapp.model.Order;
import com.shopapp.model.User;
import com.shopapp.repository.OrderRepository;
import com.shopapp.repository.ReviewRepository;
import com.shopapp.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getCurrentUserProfile() {
        return UserProfileDTO.from(getCurrentUser());
    }

    @Transactional(readOnly = true)
    public List<UserProfileDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserProfileDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return UserProfileDTO.from(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        User currentUser = getCurrentUser();
        if (currentUser.getId().equals(id)) {
            throw new AccessDeniedException("You cannot delete your own account");
        }

        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(id);
        orders.forEach(order -> order.setUser(null));
        orderRepository.saveAll(orders);
        orderRepository.flush();

        reviewRepository.deleteAll(reviewRepository.findByUserId(id));
        reviewRepository.flush();
        userRepository.delete(user);
    }
}
