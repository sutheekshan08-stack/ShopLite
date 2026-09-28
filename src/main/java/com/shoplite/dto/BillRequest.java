package com.shoplite.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BillRequest {

    private List<BillItemRequest> items;
}