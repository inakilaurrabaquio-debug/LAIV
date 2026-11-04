
document.addEventListener("DOMContentLoaded", () => {
    const movements = JSON.parse(
        localStorage.getItem("laiv-movements") || "[]"
    );

    const products = JSON.parse(
        localStorage.getItem("laiv-inventory") || "[]"
    );

    function money(value) {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN"
        }).format(value);
    }

    const income = movements
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = movements
        .filter(item => item.type === "expense")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const profit = income - expenses;
    const margin = income > 0 ? (profit / income) * 100 : 0;

    const inventoryValue = products.reduce(
        (sum, product) =>
            sum + Number(product.quantity) * Number(product.cost), 0
    );

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    setText("report-income", money(income));
    setText("report-expenses", money(expenses));
    setText("report-profit", money(profit));
    setText("report-margin", `${margin.toFixed(1)}%`);

    setText("summary-income", money(income));
    setText("summary-expenses", money(expenses));
    setText("summary-profit", money(profit));
    setText("summary-products", products.length);
    setText("summary-inventory", money(inventoryValue));
    setText("summary-movements", movements.length);

    const analysis = document.getElementById("financial-analysis");

    if (income === 0 && expenses === 0) {
        analysis.textContent =
            "Aún no existen movimientos suficientes para generar un análisis financiero.";
    } else if (profit > 0) {
        analysis.textContent =
            `El negocio presenta una utilidad de ${money(profit)} y un margen de utilidad de ${margin.toFixed(1)}%. Los ingresos registrados superan los gastos. Se recomienda mantener el control de costos y monitorear los resultados.`;
    } else if (profit < 0) {
        analysis.textContent =
            `El negocio presenta una pérdida de ${money(Math.abs(profit))}. Los gastos superan los ingresos registrados. Se recomienda revisar los costos y analizar oportunidades para mejorar los ingresos.`;
    } else {
        analysis.textContent =
            "El negocio presenta un resultado de equilibrio: los ingresos registrados son iguales a los gastos.";
    }

    // Agrupar movimientos por mes
    const monthlyData = {};

    movements.forEach(item => {
        const date = new Date(`${item.date}T12:00:00`);

        if (Number.isNaN(date.getTime())) return;

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyData[key]) {
            monthlyData[key] = {
                income: 0,
                expenses: 0
            };
        }

        if (item.type === "income") {
            monthlyData[key].income += Number(item.amount);
        } else if (item.type === "expense") {
            monthlyData[key].expenses += Number(item.amount);
        }
    });

    const months = Object.keys(monthlyData).sort();

    const labels = months.map(key => {
        const [year, month] = key.split("-");
        return new Date(Number(year), Number(month) - 1, 1)
            .toLocaleDateString("es-MX", {
                month: "short",
                year: "numeric"
            });
    });

    const chartElement = document.getElementById("monthly-chart");

    if (chartElement && typeof Chart !== "undefined" && months.length > 0) {
        new Chart(chartElement, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Ingresos",
                        data: months.map(key => monthlyData[key].income)
                    },
                    {
                        label: "Gastos",
                        data: months.map(key => monthlyData[key].expenses)
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else if (chartElement) {
        chartElement.insertAdjacentHTML(
            "afterend",
            "<p>No hay datos suficientes para mostrar la gráfica o no se pudo cargar Chart.js.</p>"
        );
    }
});
