// =====================================================
// SHOPLITE FRONTEND JAVASCRIPT
// =====================================================

const API_BASE = "http://localhost:8081/api";


// =====================================================
// PAGE NAVIGATION
// =====================================================

function showSection(sectionId) {

    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.remove("active");
    });

    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.classList.add("active");
    }

    document.querySelectorAll(".menu-btn").forEach(button => {
        button.classList.remove("active");
    });

    document.querySelectorAll(".menu-btn").forEach(button => {

        if (button.getAttribute("onclick")?.includes(sectionId)) {
            button.classList.add("active");
        }

    });

    if (sectionId === "dashboard") {
        loadDashboard();
    }

    if (sectionId === "products") {
        loadProducts();
    }

    if (sectionId === "customers") {
        loadCustomers();
    }

    if (sectionId === "orders") {
        loadOrders();
    }

    if (sectionId === "payments") {
        loadPayments();
    }
}


// =====================================================
// MESSAGE BOX
// =====================================================

function showMessage(message) {

    const messageBox =
        document.getElementById("messageBox");

    if (!messageBox) {
        alert(message);
        return;
    }

    messageBox.textContent = message;

    messageBox.classList.add("show");

    setTimeout(() => {
        messageBox.classList.remove("show");
    }, 3000);
}


// =====================================================
// ERROR HANDLER
// =====================================================

async function getErrorMessage(response) {

    try {

        const data = await response.json();

        if (data.message) {
            return data.message;
        }

        if (data.error) {
            return data.error;
        }

        return "Something went wrong.";

    } catch (error) {

        return "Server error. Please check whether ShopLite is running.";

    }
}


// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        const [
            productsResponse,
            customersResponse,
            ordersResponse,
            paymentsResponse
        ] = await Promise.all([

            fetch(`${API_BASE}/products`),

            fetch(`${API_BASE}/customers`),

            fetch(`${API_BASE}/orders`),

            fetch(`${API_BASE}/payments`)

        ]);


        const products =
            await productsResponse.json();

        const customers =
            await customersResponse.json();

        const orders =
            await ordersResponse.json();

        const payments =
            await paymentsResponse.json();


        document.getElementById("productCount").textContent =
            products.length;

        document.getElementById("customerCount").textContent =
            customers.length;

        document.getElementById("orderCount").textContent =
            orders.length;

        document.getElementById("paymentCount").textContent =
            payments.length;


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }
}


// =====================================================
// PRODUCT FORM
// =====================================================

function openProductForm() {

    // Clear old update data

    document.getElementById("productId").value = "";

    document.getElementById("productName").value = "";

    document.getElementById("productPrice").value = "";

    document.getElementById("productStock").value = "";

    document.getElementById("productReorder").value = "";


    document.getElementById("productFormTitle").textContent =
        "Add Product";

    document.getElementById("productSubmitBtn").textContent =
        "Save Product";


    document
        .getElementById("productForm")
        .classList.remove("hidden");

}


function closeProductForm() {

    document
        .getElementById("productForm")
        .classList.add("hidden");

}


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    const tableBody =
        document.getElementById("productTableBody");


    try {

        const response =
            await fetch(`${API_BASE}/products`);


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        const products =
            await response.json();


        tableBody.innerHTML = "";


        if (products.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No products found.
                    </td>
                </tr>
            `;

            return;
        }


        products.forEach(product => {

            let statusHTML;


            if (product.stockQuantity === 0) {

                statusHTML = `
                    <span class="status status-danger">
                        Out of Stock
                    </span>
                `;

            }

            else if (
                product.stockQuantity <= product.reorderLevel
            ) {

                statusHTML = `
                    <span class="status status-warning">
                        Low Stock
                    </span>
                `;

            }

            else {

                statusHTML = `
                    <span class="status status-success">
                        Available
                    </span>
                `;

            }


            tableBody.innerHTML += `

                <tr>

                    <td>
                        ${product.id}
                    </td>

                    <td>
                        <strong>
                            ${product.name}
                        </strong>
                    </td>

                    <td>
                        ₹${Number(product.price).toFixed(2)}
                    </td>

                    <td>
                        ${product.stockQuantity}
                    </td>

                    <td>
                        ${product.reorderLevel}
                    </td>

                    <td>
                        ${statusHTML}
                    </td>

                    <td>

                        <button
                            class="secondary-btn"
                            onclick="editProduct(${product.id})">
                            ✏️ Edit
                        </button>

                        <button
                            class="secondary-btn"
                            onclick="deleteProduct(${product.id})">
                            🗑️ Delete
                        </button>

                    </td>

                </tr>

            `;

        });


        document.getElementById("productCount").textContent =
            products.length;


    } catch (error) {

        console.error(
            "Product error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load products.
                </td>
            </tr>
        `;


        showMessage(error.message);

    }
}


// =====================================================
// ADD / UPDATE PRODUCT
// =====================================================

async function saveProduct(event) {

    event.preventDefault();


    const id =
        document.getElementById("productId").value;


    const product = {

        name:
            document
                .getElementById("productName")
                .value
                .trim(),

        price:
            Number(
                document
                    .getElementById("productPrice")
                    .value
            ),

        stockQuantity:
            Number(
                document
                    .getElementById("productStock")
                    .value
            ),

        reorderLevel:
            Number(
                document
                    .getElementById("productReorder")
                    .value
            )

    };


    try {

        let response;


        // =============================================
        // UPDATE
        // =============================================

        if (id) {

            response =
                await fetch(
                    `${API_BASE}/products/${id}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(product)

                    }
                );

        }


            // =============================================
            // ADD
        // =============================================

        else {

            response =
                await fetch(
                    `${API_BASE}/products`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(product)

                    }
                );

        }


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        await response.json();


        if (id) {

            showMessage(
                "Product updated successfully!"
            );

        }

        else {

            showMessage(
                "Product added successfully!"
            );

        }


        document
            .querySelector("#productForm form")
            .reset();


        document.getElementById("productId").value = "";


        document.getElementById("productFormTitle")
            .textContent = "Add Product";


        document.getElementById("productSubmitBtn")
            .textContent = "Save Product";


        closeProductForm();


        await loadProducts();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Product save error:",
            error
        );

        showMessage(error.message);

    }
}


// =====================================================
// EDIT PRODUCT
// =====================================================

async function editProduct(id) {

    try {

        const response =
            await fetch(
                `${API_BASE}/products/${id}`
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        const product =
            await response.json();


        document.getElementById("productId").value =
            product.id;


        document.getElementById("productName").value =
            product.name;


        document.getElementById("productPrice").value =
            product.price;


        document.getElementById("productStock").value =
            product.stockQuantity;


        document.getElementById("productReorder").value =
            product.reorderLevel;


        document.getElementById("productFormTitle")
            .textContent = "Update Product";


        document.getElementById("productSubmitBtn")
            .textContent = "Update Product";


        document
            .getElementById("productForm")
            .classList.remove("hidden");


        document
            .getElementById("productForm")
            .scrollIntoView({
                behavior: "smooth"
            });


    } catch (error) {

        console.error(
            "Edit product error:",
            error
        );

        showMessage(error.message);

    }
}


// =====================================================
// DELETE PRODUCT
// =====================================================

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/products/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        showMessage(
            "Product deleted successfully!"
        );


        await loadProducts();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        showMessage(error.message);

    }
}


// =====================================================
// CUSTOMER FORM
// =====================================================

function openCustomerForm() {

    document.getElementById("customerId").value = "";

    document.getElementById("customerName").value = "";

    document.getElementById("customerEmail").value = "";

    document.getElementById("customerPhone").value = "";


    document.getElementById("customerFormTitle")
        .textContent = "Add Customer";


    document.getElementById("customerSubmitBtn")
        .textContent = "Save Customer";


    document
        .getElementById("customerForm")
        .classList.remove("hidden");

}


function closeCustomerForm() {

    document
        .getElementById("customerForm")
        .classList.add("hidden");

}


// =====================================================
// LOAD CUSTOMERS
// =====================================================

async function loadCustomers() {

    const tableBody =
        document.getElementById("customerTableBody");


    try {

        const response =
            await fetch(
                `${API_BASE}/customers`
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        const customers =
            await response.json();


        tableBody.innerHTML = "";


        if (customers.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No customers found.
                    </td>
                </tr>
            `;

            return;
        }


        customers.forEach(customer => {

            tableBody.innerHTML += `

                <tr>

                    <td>
                        ${customer.id}
                    </td>

                    <td>
                        <strong>
                            ${customer.name}
                        </strong>
                    </td>

                    <td>
                        ${customer.email}
                    </td>

                    <td>
                        ${customer.phone}
                    </td>

                    <td>

                        <button
                            class="secondary-btn"
                            onclick="editCustomer(${customer.id})">
                            ✏️ Edit
                        </button>

                        <button
                            class="secondary-btn"
                            onclick="deleteCustomer(${customer.id})">
                            🗑️ Delete
                        </button>

                    </td>

                </tr>

            `;

        });


        document.getElementById("customerCount")
            .textContent =
            customers.length;


    } catch (error) {

        console.error(
            "Customer error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load customers.
                </td>
            </tr>
        `;


        showMessage(error.message);

    }
}


// =====================================================
// ADD / UPDATE CUSTOMER
// =====================================================

async function saveCustomer(event) {

    event.preventDefault();


    const id =
        document.getElementById("customerId").value;


    const customer = {

        name:
            document
                .getElementById("customerName")
                .value
                .trim(),

        email:
            document
                .getElementById("customerEmail")
                .value
                .trim(),

        phone:
            document
                .getElementById("customerPhone")
                .value
                .trim()

    };


    try {

        let response;


        // UPDATE

        if (id) {

            response =
                await fetch(
                    `${API_BASE}/customers/${id}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(customer)

                    }
                );

        }


        // ADD

        else {

            response =
                await fetch(
                    `${API_BASE}/customers`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(customer)

                    }
                );

        }


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        await response.json();


        if (id) {

            showMessage(
                "Customer updated successfully!"
            );

        }

        else {

            showMessage(
                "Customer added successfully!"
            );

        }


        document
            .querySelector("#customerForm form")
            .reset();


        document.getElementById("customerId").value = "";


        document.getElementById("customerFormTitle")
            .textContent = "Add Customer";


        document.getElementById("customerSubmitBtn")
            .textContent = "Save Customer";


        closeCustomerForm();


        await loadCustomers();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Customer save error:",
            error
        );

        showMessage(error.message);

    }
}


// =====================================================
// EDIT CUSTOMER
// =====================================================

async function editCustomer(id) {

    try {

        const response =
            await fetch(
                `${API_BASE}/customers/${id}`
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        const customer =
            await response.json();


        document.getElementById("customerId").value =
            customer.id;


        document.getElementById("customerName").value =
            customer.name;


        document.getElementById("customerEmail").value =
            customer.email;


        document.getElementById("customerPhone").value =
            customer.phone;


        document.getElementById("customerFormTitle")
            .textContent = "Update Customer";


        document.getElementById("customerSubmitBtn")
            .textContent = "Update Customer";


        document
            .getElementById("customerForm")
            .classList.remove("hidden");


        document
            .getElementById("customerForm")
            .scrollIntoView({
                behavior: "smooth"
            });


    } catch (error) {

        console.error(
            "Edit customer error:",
            error
        );

        showMessage(error.message);

    }
}


// =====================================================
// DELETE CUSTOMER
// =====================================================

async function deleteCustomer(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this customer?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/customers/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        showMessage(
            "Customer deleted successfully!"
        );


        await loadCustomers();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Delete customer error:",
            error
        );

        showMessage(error.message);

    }
}


// =====================================================
// ORDERS
// =====================================================

async function loadOrders() {

    const tableBody =
        document.getElementById("orderTableBody");


    try {

        const response =
            await fetch(
                `${API_BASE}/orders`
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        const orders =
            await response.json();


        tableBody.innerHTML = "";


        if (orders.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No orders found.
                    </td>
                </tr>
            `;

            return;
        }


        orders.forEach(order => {

            let statusClass =
                "status-info";


            if (order.status === "PAID") {
                statusClass =
                    "status-success";
            }


            if (order.status === "PLACED") {
                statusClass =
                    "status-warning";
            }


            if (order.status === "CANCELLED") {
                statusClass =
                    "status-danger";
            }


            const customerName =
                order.customer?.name ||
                `Customer #${order.customer?.id || "-"}`;


            const orderDate =
                order.orderDate
                    ? new Date(
                        order.orderDate
                    ).toLocaleString()
                    : "-";


            tableBody.innerHTML += `

                <tr>

                    <td>
                        ${order.id}
                    </td>

                    <td>
                        ${customerName}
                    </td>

                    <td>
                        ₹${Number(
                order.totalAmount || 0
            ).toFixed(2)}
                    </td>

                    <td>

                        <span class="status ${statusClass}">
                            ${order.status || "-"}
                        </span>

                    </td>

                    <td>
                        ${orderDate}
                    </td>

                </tr>

            `;

        });


        document.getElementById("orderCount")
            .textContent =
            orders.length;


    } catch (error) {

        console.error(
            "Order error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load orders.
                </td>
            </tr>
        `;


        showMessage(error.message);

    }
}


// =====================================================
// PAYMENTS
// =====================================================

async function loadPayments() {

    const tableBody =
        document.getElementById("paymentTableBody");


    try {

        const response =
            await fetch(
                `${API_BASE}/payments`
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        const payments =
            await response.json();


        tableBody.innerHTML = "";


        if (payments.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No payments found.
                    </td>
                </tr>
            `;

            return;
        }


        payments.forEach(payment => {

            let statusClass =
                "status-warning";


            if (payment.status === "SUCCESS") {

                statusClass =
                    "status-success";

            }


            if (
                payment.status === "FAILED" ||
                payment.status === "CANCELLED"
            ) {

                statusClass =
                    "status-danger";

            }


            const orderId =
                payment.order?.id || "-";


            const paymentDate =
                payment.paymentDate
                    ? new Date(
                        payment.paymentDate
                    ).toLocaleString()
                    : "-";


            tableBody.innerHTML += `

                <tr>

                    <td>
                        ${payment.id}
                    </td>

                    <td>
                        ${orderId}
                    </td>

                    <td>
                        ₹${Number(
                payment.amount || 0
            ).toFixed(2)}
                    </td>

                    <td>
                        ${payment.paymentMethod || "-"}
                    </td>

                    <td>

                        <span class="status ${statusClass}">
                            ${payment.status || "-"}
                        </span>

                    </td>

                    <td>
                        ${paymentDate}
                    </td>

                </tr>

            `;

        });


        document.getElementById("paymentCount")
            .textContent =
            payments.length;


    } catch (error) {

        console.error(
            "Payment error:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load payments.
                </td>
            </tr>
        `;


        showMessage(error.message);

    }
}


// =====================================================
// BILLING
// =====================================================

function openBillingForm() {

    document
        .getElementById("billingForm")
        .classList.remove("hidden");

}


function closeBillingForm() {

    document
        .getElementById("billingForm")
        .classList.add("hidden");

}


// =====================================================
// CREATE BILL
// =====================================================

async function createBill(event) {

    event.preventDefault();


    const productId =
        Number(
            document
                .getElementById("billProductId")
                .value
        );


    const quantity =
        Number(
            document
                .getElementById("billQuantity")
                .value
        );


    const billRequest = {

        items: [

            {
                productId: productId,
                quantity: quantity
            }

        ]

    };


    try {

        const response =
            await fetch(
                `${API_BASE}/billing`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(billRequest)

                }
            );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        const bill =
            await response.json();


        showMessage(
            `Bill #${bill.id} created successfully!`
        );


        document
            .querySelector("#billingForm form")
            .reset();


        closeBillingForm();


        await loadProducts();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Billing error:",
            error
        );

        showMessage(error.message);

    }
}


// =====================================================
// INITIAL PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboard();

        loadProducts();

    }
);