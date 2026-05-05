package com.shopapp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class OrderRequest {

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    @NotBlank
    private String address;
}
