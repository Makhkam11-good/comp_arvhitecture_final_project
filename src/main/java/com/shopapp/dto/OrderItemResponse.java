package com.shopapp.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class OrderItemResponse {

    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}
