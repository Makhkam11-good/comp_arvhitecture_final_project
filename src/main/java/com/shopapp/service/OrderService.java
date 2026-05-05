package com.shopapp.service;

import com.shopapp.dto.OrderItemRequest;
import com.shopapp.dto.OrderItemResponse;
import com.shopapp.dto.OrderRequest;
import com.shopapp.dto.OrderResponse;
import com.shopapp.exception.ResourceNotFoundException;
import com.shopapp.model.Order;
import com.shopapp.model.OrderItem;
import com.shopapp.model.OrderStatus;
import com.shopapp.model.Product;
import com.shopapp.model.Role;
import com.shopapp.model.User;
import com.shopapp.repository.OrderItemRepository;
import com.shopapp.repository.OrderRepository;
import com.shopapp.repository.ProductRepository;
import com.shopapp.repository.UserRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest req) {
        User user = getCurrentUser();

        Order order = new Order();
        order.setUser(user);
        order.setAddress(req.getAddress());

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemRequest item : req.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.getProductId()));

            if (product.getStock() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName()
                        + ". Available: " + product.getStock());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());

            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            orderItems.add(orderItem);
        }

        order.setTotalPrice(total);
        Order savedOrder = orderRepository.save(order);

        orderItems.forEach(orderItem -> {
            orderItem.setOrder(savedOrder);
            orderItemRepository.save(orderItem);
        });

        return buildOrderResponse(savedOrder, orderItems);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        User user = getCurrentUser();
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return orders.stream()
                .map(order -> buildOrderResponse(order, orderItemRepository.findByOrderId(order.getId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        User user = getCurrentUser();

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Access denied");
        }

        return buildOrderResponse(order, orderItemRepository.findByOrderId(id));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(order -> buildOrderResponse(order, orderItemRepository.findByOrderId(order.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);
        return buildOrderResponse(savedOrder, orderItemRepository.findByOrderId(id));
    }

    private OrderResponse buildOrderResponse(Order order, List<OrderItem> items) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setStatus(order.getStatus().name());
        response.setTotalPrice(order.getTotalPrice());
        response.setAddress(order.getAddress());
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(items.stream()
                .map(this::buildOrderItemResponse)
                .collect(Collectors.toList()));
        return response;
    }

    private OrderItemResponse buildOrderItemResponse(OrderItem item) {
        Product product = item.getProduct();

        OrderItemResponse response = new OrderItemResponse();
        response.setProductId(product.getId());
        response.setProductName(product.getName());
        response.setQuantity(item.getQuantity());
        response.setPrice(item.getPrice());
        response.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        return response;
    }
}
