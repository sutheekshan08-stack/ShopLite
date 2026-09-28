package com.shoplite.service;

import com.shoplite.entity.Order;
import com.shoplite.entity.OrderItem;
import com.shoplite.entity.Product;
import com.shoplite.repository.OrderRepository;
import com.shoplite.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(Order order) {

        order.setOrderDate(LocalDateTime.now());

        double total = 0.0;

        for (OrderItem item : order.getItems()) {

            Product product = productRepository.findById(
                    item.getProduct().getId()
            ).orElseThrow(() ->
                    new RuntimeException(
                            "Product not found with ID: "
                                    + item.getProduct().getId()
                    )
            );

            int quantity = item.getQuantity();

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

            item.setOrder(order);
            item.setProduct(product);
            item.setPrice(product.getPrice());

            // Reduce stock after ordering
            product.setStockQuantity(
                    product.getStockQuantity() - quantity
            );

            productRepository.save(product);

            total += product.getPrice() * quantity;
        }

        order.setTotalAmount(total);

        if (order.getStatus() == null) {
            order.setStatus("PLACED");
        }

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with ID: " + id
                        )
                );
    }

    public Order updateOrder(Long id, Order order) {

        Order existingOrder = getOrderById(id);

        existingOrder.setOrderDate(order.getOrderDate());
        existingOrder.setTotalAmount(order.getTotalAmount());
        existingOrder.setStatus(order.getStatus());
        existingOrder.setCustomer(order.getCustomer());

        return orderRepository.save(existingOrder);
    }

    public void deleteOrder(Long id) {

        Order existingOrder = getOrderById(id);

        orderRepository.delete(existingOrder);
    }
}