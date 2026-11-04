
/* ==========================================
   GRUPO LAIV
   Archivo: app.js
   Administración general de datos
========================================== */

// CLAVE DE ALMACENAMIENTO
const STORAGE_KEY = "laiv-movements";

// FORMATO DE MONEDA MEXICANA
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN"
    }).format(amount);
};

// FECHA ACTUAL
const today = new Date();


// DATOS DEMOSTRATIVOS INICIALES
const demoMovements = [
    {
        id: 1,
        description: "Venta de productos",
        category: "Ventas",
        type: "income",
        amount: 8500,
        date: "2026-11-01"
    },
    {
        id: 2,
        description: "Compra de mercancía",
        category: "Inventario",
        type: "expense",
        amount: 3200,
        date: "2026-11-01"
    },
    {
        id: 3,
        description: "Venta de servicios",
        category: "Servicios",
        type: "income",
        amount: 6200,
        date: "2026-11-02"
    },
    {
        id: 4,
        description: "Pago de electricidad",
        category: "Servicios",
        type: "expense",
        amount: 950,
        date: "2026-11-02"
    },
    {
        id: 5,
        description: "Venta de mercancía",
        category: "Ventas",
        type: "income",
        amount: 4800,
        date: "2026-11-03"
    },
    {
        id: 6,
        description: "Gastos administrativos",
        category: "Administración",
        type: "expense",
        amount: 1200,
        date: "2026-11-03"
    }
];


// INICIALIZAR INFORMACIÓN
function initializeData() {

    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData === null) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(demoMovements)
        );
    }

}


// OBTENER MOVIMIENTOS
function getMovements() {

    const data = localStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : [];

}


// GUARDAR MOVIMIENTOS
function saveMovements(movements) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(movements)
    );

}


// CALCULAR INGRESOS
function calculateIncome(movements) {

    return movements
        .filter(item => item.type === "income")
        .reduce((total, item) => total + Number(item.amount), 0);

}


// CALCULAR GASTOS
function calculateExpenses(movements) {

    return movements
        .filter(item => item.type === "expense")
        .reduce((total, item) => total + Number(item.amount), 0);

}


// CALCULAR UTILIDAD
function calculateProfit(movements) {

    return calculateIncome(movements) -
           calculateExpenses(movements);

}


// ACTUALIZAR INDICADORES DEL DASHBOARD
function updateDashboard() {

    const movements = getMovements();

    const income = calculateIncome(movements);
    const expenses = calculateExpenses(movements);
    const profit = calculateProfit(movements);

    const incomeElement = document.getElementById("total-income");
    const expensesElement = document.getElementById("total-expenses");
    const profitElement = document.getElementById("total-profit");
    const movementsElement = document.getElementById("total-movements");

    if (incomeElement) {
        incomeElement.textContent = formatCurrency(income);
    }

    if (expensesElement) {
        expensesElement.textContent = formatCurrency(expenses);
    }

    if (profitElement) {
        profitElement.textContent = formatCurrency(profit);
    }

    if (movementsElement) {
        movementsElement.textContent = movements.length;
    }

}


// ACTUALIZAR FECHA
function updateDate() {

    const dateElement = document.getElementById("current-date");

    if (dateElement) {

        dateElement.textContent = today.toLocaleDateString(
            "es-MX",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    }

}


// MOSTRAR MOVIMIENTOS RECIENTES
function updateRecentMovements() {

    const table = document.getElementById("recent-movements");

    if (!table) return;

    const movements = getMovements();

    const recent = [...movements]
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
        .slice(0, 5);

    if (recent.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">No hay movimientos registrados.</td>
            </tr>
        `;

        return;
    }

    table.innerHTML = recent.map(item => {

        const isIncome = item.type === "income";

        return `
            <tr>
                <td>${item.description || item.concept || 'Movimiento'}</td>
                <td>${item.category}</td>
                <td>${item.date}</td>
                <td>
                    <span class="${isIncome ? "badge-income" : "badge-expense"}">
                        ${isIncome ? "Ingreso" : "Gasto"}
                    </span>
                </td>
                <td>${formatCurrency(item.amount)}</td>
            </tr>
        `;

    }).join("");

}


// VARIABLES PARA LAS GRÁFICAS
let financeChart = null;
let distributionChart = null;


// CREAR GRÁFICA DE INGRESOS Y GASTOS
function createFinanceChart() {

    const canvas = document.getElementById("financeChart");

    if (!canvas || typeof Chart === "undefined") return;

    const movements = getMovements();

    const months = [];

    for (let i = 5; i >= 0; i--) {

        const date = new Date(
            today.getFullYear(),
            today.getMonth() - i,
            1
        );

        months.push({
            year: date.getFullYear(),
            month: date.getMonth(),
            label: date.toLocaleDateString("es-MX", {
                month: "short"
            })
        });

    }

    const incomes = months.map(month => {

        return movements
            .filter(item => {

                const date = new Date(item.date + "T12:00:00");

                return item.type === "income" &&
                    date.getFullYear() === month.year &&
                    date.getMonth() === month.month;

            })
            .reduce((total, item) => total + Number(item.amount), 0);

    });

    const expenses = months.map(month => {

        return movements
            .filter(item => {

                const date = new Date(item.date + "T12:00:00");

                return item.type === "expense" &&
                    date.getFullYear() === month.year &&
                    date.getMonth() === month.month;

            })
            .reduce((total, item) => total + Number(item.amount), 0);

    });

    if (financeChart) financeChart.destroy();

    financeChart = new Chart(canvas, {

        type: "bar",

        data: {
            labels: months.map(month => month.label),

            datasets: [
                {
                    label: "Ingresos",
                    data: incomes,
                    backgroundColor: "#718b75",
                    borderRadius: 5
                },
                {
                    label: "Gastos",
                    data: expenses,
                    backgroundColor: "#c58c83",
                    borderRadius: 5
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

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

}


// CREAR GRÁFICA DE DISTRIBUCIÓN
function createDistributionChart() {

    const canvas = document.getElementById("distributionChart");

    if (!canvas || typeof Chart === "undefined") return;

    const movements = getMovements();

    const income = calculateIncome(movements);
    const expenses = calculateExpenses(movements);

    if (distributionChart) distributionChart.destroy();

    distributionChart = new Chart(canvas, {

        type: "doughnut",

        data: {
            labels: ["Ingresos", "Gastos"],

            datasets: [{
                data: [income, expenses],
                backgroundColor: ["#718b75", "#c58c83"],
                borderWidth: 0
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }

    });

}


// INICIAR APLICACIÓN
function initializeDashboard() {

    initializeData();

    updateDashboard();
    updateDate();
    updateRecentMovements();

    createFinanceChart();
    createDistributionChart();

}


// OBJETO COMPARTIDO PARA LAS DEMÁS PÁGINAS
window.LAIV = {
    formatCurrency,
    getMovements,
    saveMovements,
    calculateIncome,
    calculateExpenses,
    calculateProfit,
    updateDashboard,
    initializeData
};


// EJECUTAR AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});
