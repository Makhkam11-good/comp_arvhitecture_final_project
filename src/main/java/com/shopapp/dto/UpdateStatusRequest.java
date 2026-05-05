package com.shopapp.dto;

import com.shopapp.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {

    @NotNull
    private OrderStatus status;
}
