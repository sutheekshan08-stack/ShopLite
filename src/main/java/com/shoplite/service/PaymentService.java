package com.shoplite.service;

import com.shoplite.entity.Order;
import com.shoplite.entity.Payment;
import com.shoplite.repository.OrderRepository;
import com.shoplite.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    // Create Payment
    public Payment createPayment(Payment payment) {

        // Find the order
        Order order = orderRepository.findById(
                payment.getOrder().getId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Order not found with ID: "
                                + payment.getOrder().getId()
                )
        );

        // Set payment date
        payment.setPaymentDate(LocalDateTime.now());

        // Set default payment status
        if (payment.getStatus() == null) {
            payment.setStatus("SUCCESS");
        }

        // Update order status when payment is successful
        if ("SUCCESS".equalsIgnoreCase(payment.getStatus())) {
            order.setStatus("PAID");
            orderRepository.save(order);
        }

        // Connect payment with the actual order
        payment.setOrder(order);

        return paymentRepository.save(payment);
    }

    // Get all payments
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // Get payment by ID
    public Payment getPaymentById(Long id) {

        return paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with ID: " + id
                        )
                );
    }

    // Update payment
    public Payment updatePayment(Long id, Payment payment) {

        Payment existingPayment = getPaymentById(id);

        existingPayment.setAmount(payment.getAmount());
        existingPayment.setPaymentMethod(payment.getPaymentMethod());
        existingPayment.setStatus(payment.getStatus());

        return paymentRepository.save(existingPayment);
    }

    // Delete payment
    public void deletePayment(Long id) {

        Payment existingPayment = getPaymentById(id);

        paymentRepository.delete(existingPayment);
    }
}