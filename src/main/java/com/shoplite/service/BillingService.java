package com.shoplite.service;

import com.shoplite.dto.BillItemRequest;
import com.shoplite.dto.BillRequest;
import com.shoplite.entity.Bill;
import com.shoplite.entity.BillItem;
import com.shoplite.entity.Product;
import com.shoplite.repository.BillRepository;
import com.shoplite.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class BillingService {

    private final BillRepository billRepository;
    private final ProductRepository productRepository;

    public BillingService(
            BillRepository billRepository,
            ProductRepository productRepository) {

        this.billRepository = billRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Bill createBill(BillRequest request) {

        Bill bill = new Bill();

        bill.setBillDate(LocalDateTime.now());
        bill.setFinalized(false);
        bill.setTotalAmount(0.0);

        double total = 0.0;

        for (BillItemRequest itemRequest : request.getItems()) {

            Product product = productRepository.findById(
                    itemRequest.getProductId()
            ).orElseThrow(() ->
                    new RuntimeException(
                            "Product not found with ID: "
                                    + itemRequest.getProductId()
                    )
            );

            int quantity = itemRequest.getQuantity();

            if (quantity <= 0) {
                throw new RuntimeException(
                        "Quantity must be greater than zero"
                );
            }

            if (product.getStockQuantity() < quantity) {
                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            BillItem billItem = new BillItem();

            billItem.setBill(bill);
            billItem.setProduct(product);
            billItem.setQuantity(quantity);
            billItem.setPrice(product.getPrice());

            bill.getItems().add(billItem);

            total += product.getPrice() * quantity;
        }

        bill.setTotalAmount(total);

        return billRepository.save(bill);
    }

    @Transactional
    public Bill finalizeBill(Long billId) {

        Bill bill = billRepository.findById(billId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Bill not found with ID: " + billId
                        )
                );

        if (bill.isFinalized()) {
            throw new RuntimeException(
                    "Bill is already finalized"
            );
        }

        for (BillItem billItem : bill.getItems()) {

            Product product = billItem.getProduct();

            int quantity = billItem.getQuantity();

            if (product.getStockQuantity() < quantity) {
                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            product.setStockQuantity(
                    product.getStockQuantity() - quantity
            );

            productRepository.save(product);
        }

        bill.setFinalized(true);

        return billRepository.save(bill);
    }
}