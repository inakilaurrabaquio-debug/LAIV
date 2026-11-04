
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("inventory-form");
    const table = document.getElementById("inventory-table");
    const message = document.getElementById("inventory-message");

    if (!form || !table) return;

    const STORAGE_KEY = "laiv-inventory";

    function getProducts() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    }

    function saveProducts(products) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }

    function money(value) {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN"
        }).format(value);
    }

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function renderInventory() {
        const products = getProducts();

        const totalUnits = products.reduce(
            (sum, product) => sum + Number(product.quantity), 0
        );

        const totalValue = products.reduce(
            (sum, product) =>
                sum + Number(product.quantity) * Number(product.cost), 0
        );

        document.getElementById("product-count").textContent = products.length;
        document.getElementById("total-units").textContent = totalUnits;
        document.getElementById("inventory-value").textContent = money(totalValue);

        table.innerHTML = "";

        if (products.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7">Todavía no hay productos registrados.</td>
                </tr>
            `;
            return;
        }

        products.forEach(product => {
            const quantity = Number(product.quantity);
            const minimum = Number(product.minQuantity);
            const value = quantity * Number(product.cost);
            const lowStock = quantity <= minimum;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHTML(product.name)}</td>
                <td>${escapeHTML(product.category)}</td>
                <td>${quantity} ${escapeHTML(product.unit)}</td>
                <td>${money(product.cost)}</td>
                <td>${money(value)}</td>
                <td>
                    <span class="${lowStock ? "badge-expense" : "badge-income"}">
                        ${lowStock ? "Existencia baja" : "Disponible"}
                    </span>
                </td>
                <td>
                    <button class="btn-danger" type="button"
                        data-delete="${escapeHTML(product.id)}">
                        Eliminar
                    </button>
                </td>
            `;

            table.appendChild(row);
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("product-name").value.trim();
        const category = document.getElementById("product-category").value.trim();
        const unit = document.getElementById("product-unit").value;
        const quantity = Number(document.getElementById("product-quantity").value);
        const cost = Number(document.getElementById("product-cost").value);
        const minQuantity = Number(document.getElementById("product-minimum").value);

        if (
            !name || !category ||
            !Number.isInteger(quantity) || quantity < 0 ||
            !Number.isFinite(cost) || cost < 0 ||
            !Number.isInteger(minQuantity) || minQuantity < 0
        ) {
            message.textContent = "Verifica los datos ingresados.";
            return;
        }

        const products = getProducts();

        products.push({
            id: String(Date.now()),
            name,
            category,
            unit,
            quantity,
            cost,
            minQuantity
        });

        saveProducts(products);
        form.reset();
        message.textContent = "Producto agregado correctamente.";

        renderInventory();
    });

    table.addEventListener("click", event => {
        const button = event.target.closest("[data-delete]");
        if (!button) return;

        if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

        const id = button.dataset.delete;
        const products = getProducts().filter(
            product => String(product.id) !== id
        );

        saveProducts(products);
        renderInventory();
    });

    renderInventory();
});
