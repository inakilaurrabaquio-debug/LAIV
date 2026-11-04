
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("movement-form");
    const table = document.getElementById("movements-table");
    const filter = document.getElementById("movement-filter");
    const count = document.getElementById("movement-count");
    const message = document.getElementById("form-message");
    const dateInput = document.getElementById("movement-date");

    if (!form || !table || !window.LAIV) return;

    const today = new Date();
    const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    dateInput.value = localDate;

    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function renderMovements() {
        const movements = window.LAIV.getMovements();
        const selectedFilter = filter.value;

        const filtered = movements.filter(movement =>
            selectedFilter === "all" || movement.type === selectedFilter
        );

        table.innerHTML = "";

        if (filtered.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6">No hay movimientos para mostrar.</td>
                </tr>
            `;
        } else {
            filtered.forEach(movement => {
                const row = document.createElement("tr");
                const isIncome = movement.type === "income";

                row.innerHTML = `
                    <td>${escapeHTML(movement.date)}</td>
                    <td>${escapeHTML(movement.description)}</td>
                    <td>${escapeHTML(movement.category)}</td>
                    <td>
                        <span class="${isIncome ? "badge-income" : "badge-expense"}">
                            ${isIncome ? "Ingreso" : "Gasto"}
                        </span>
                    </td>
                    <td>${window.LAIV.formatCurrency(movement.amount)}</td>
                    <td>
                        <button class="btn-danger"
                            data-delete="${escapeHTML(movement.id)}"
                            type="button">
                            Eliminar
                        </button>
                    </td>
                `;

                table.appendChild(row);
            });
        }

        count.textContent = `Movimientos registrados: ${movements.length}`;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const description = document.getElementById("movement-description").value.trim();
        const type = document.getElementById("movement-type").value;
        const category = document.getElementById("movement-category").value;
        const amount = Number(document.getElementById("movement-amount").value);
        const date = dateInput.value;

        if (!description || !date || !Number.isFinite(amount) || amount <= 0) {
            message.textContent = "Revisa los datos e ingresa un importe válido.";
            return;
        }

        const movements = window.LAIV.getMovements();

        movements.push({
            id: String(Date.now()),
            description,
            type,
            category,
            amount,
            date
        });

        window.LAIV.saveMovements(movements);

        form.reset();
        dateInput.value = localDate;
        message.textContent = "Movimiento registrado correctamente.";

        renderMovements();
    });

    table.addEventListener("click", event => {
        const button = event.target.closest("[data-delete]");
        if (!button) return;

        const id = button.dataset.delete;

        if (!confirm("¿Seguro que deseas eliminar este movimiento?")) return;

        const movements = window.LAIV.getMovements()
            .filter(movement => String(movement.id) !== id);

        window.LAIV.saveMovements(movements);
        renderMovements();
    });

    filter.addEventListener("change", renderMovements);

    renderMovements();
});
