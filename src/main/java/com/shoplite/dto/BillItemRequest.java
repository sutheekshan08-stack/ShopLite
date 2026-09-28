package com.shoplite.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BillItemRequest {

    private Long productId;

    private Integer quantity;
}