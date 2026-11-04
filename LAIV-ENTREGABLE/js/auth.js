
const USERS_KEY = "laiv-demo-users";
const SESSION_KEY = "laiv-demo-session";

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (error) {
        return null;
    }
}

function closeSession() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "index.html";
}

// El acceso ya no está restringido.
// Todas las páginas se pueden visitar libremente.

const authForm = document.getElementById("auth-form");

if (authForm) {
    let registerMode = false;

    const nameGroup = document.getElementById("name-group");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const message = document.getElementById("auth-message");
    const formTitle = document.getElementById("form-title");
    const formDescription = document.getElementById("form-description");
    const submitButton = document.getElementById("submit-button");
    const toggleMode = document.getElementById("toggle-mode");
    const toggleText = document.getElementById("toggle-text");

    toggleMode.addEventListener("click", () => {
        registerMode = !registerMode;

        nameGroup.hidden = !registerMode;
        nameInput.required = registerMode;

        formTitle.textContent = registerMode
            ? "Crear cuenta"
            : "Bienvenido a LAIV";

        formDescription.textContent = registerMode
            ? "Registra una cuenta demostrativa."
            : "Ingresa para conocer la experiencia LAIV.";

        submitButton.textContent = registerMode
            ? "Registrarme"
            : "Iniciar sesión";

        toggleText.textContent = registerMode
            ? "¿Ya tienes cuenta?"
            : "¿No tienes cuenta?";

        toggleMode.textContent = registerMode
            ? "Inicia sesión"
            : "Crear cuenta";

        message.textContent = "";
    });

    authForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const users = getUsers();

        if (registerMode) {
            const name = nameInput.value.trim();

            if (users.some(user => user.email === email)) {
                message.textContent = "Este correo ya está registrado.";
                return;
            }

            users.push({ name, email, password });
            saveUsers(users);

            message.textContent = "Cuenta demostrativa creada correctamente.";
            authForm.reset();
            return;
        }

        const user = users.find(
            item => item.email === email && item.password === password
        );

        if (!user) {
            message.textContent =
                "No encontramos esa cuenta. Puedes crear una cuenta demostrativa.";
            return;
        }

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ name: user.name, email: user.email })
        );

        message.textContent = "Inicio de sesión correcto.";

        window.location.href = "movimientos.html";
    });
}
