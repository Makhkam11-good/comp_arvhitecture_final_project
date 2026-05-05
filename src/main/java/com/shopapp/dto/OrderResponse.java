package com.shopapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class OrderResponse {

    private Long id;
    private String status;
    private BigDecimal totalPrice;
    private String address;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
