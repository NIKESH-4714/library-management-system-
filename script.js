
const defaultBooks = [
    { id: 1, title: "Wings of Fire", author: "A.P.J. Abdul Kalam", borrowedBy: "" },
    { id: 2, title: "The Alchemist", author: "Paulo Coelho", borrowedBy: "" },
    { id: 3, title: "Harry Potter", author: "J.K. Rowling", borrowedBy: "" }
];

if (localStorage.getItem("books") === null) {
    localStorage.setItem("books", JSON.stringify(defaultBooks));
}

function getBooks() {
    return JSON.parse(localStorage.getItem("books")) || [];
}

function saveBooks(books) {
    localStorage.setItem("books", JSON.stringify(books));
}

function register() {
    let name = document.getElementById("regName").value.trim();
    let email = document.getElementById("regEmail").value.trim().toLowerCase();
    let password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        alert("Please fill all registration fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (email === "admin" || users.some(u => u.email === email)) {
        alert("This username or email is already registered.");
        return;
    }

    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! Please login.");
}

function login() {
    let email = document.getElementById("loginEmail").value.trim().toLowerCase();
    let password = document.getElementById("loginPassword").value;

    if (email === "admin" && password === "admin123") {
        localStorage.setItem("currentUser", JSON.stringify({
            email: "admin",
            role: "admin"
        }));
        location.href = "admin.html";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify({
            name: user.name,
            email: user.email,
            role: "user"
        }));
        location.href = "user.html";
    } else {
        document.getElementById("message").innerText =
            "Invalid email or password!";
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    location.href = "index.html";
}

function showBooks() {
    let current = JSON.parse(localStorage.getItem("currentUser"));

    if (!current || current.role !== "user") {
        location.href = "index.html";
        return;
    }

    let books = getBooks();
    let output = "";

    books.forEach(book => {
        let borrowed = book.borrowedBy === current.email;

        output += `<div class="book">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Status: ${book.borrowedBy ?
                (borrowed ? "Borrowed by you" : "Not available") :
                "Available"}</p>`;

        if (borrowed) {
            output += `<button onclick="returnBook(${book.id})">Return</button>`;
        } else if (!book.borrowedBy) {
            output += `<button onclick="borrowBook(${book.id})">Borrow</button>`;
        }

        output += "</div>";
    });

    document.getElementById("books").innerHTML =
        output || "<p>No books available.</p>";
}

function borrowBook(id) {
    let current = JSON.parse(localStorage.getItem("currentUser"));

    if (!current || current.role !== "user") {
        location.href = "index.html";
        return;
    }

    let books = getBooks();
    let book = books.find(b => b.id === id);

    if (book && !book.borrowedBy) {
        book.borrowedBy = current.email;
        saveBooks(books);
        showBooks();
    } else {
        alert("This book is not available.");
    }
}

function returnBook(id) {
    let current = JSON.parse(localStorage.getItem("currentUser"));

    if (!current || current.role !== "user") {
        location.href = "index.html";
        return;
    }

    let books = getBooks();
    let book = books.find(b => b.id === id);

    if (book && book.borrowedBy === current.email) {
        book.borrowedBy = "";
        saveBooks(books);
        showBooks();
    }
}

function addBook() {
    let current = JSON.parse(localStorage.getItem("currentUser"));

    if (!current || current.role !== "admin") {
        location.href = "index.html";
        return;
    }

    let title = document.getElementById("bookTitle").value.trim();
    let author = document.getElementById("bookAuthor").value.trim();

    if (!title || !author) {
        alert("Enter the book title and author.");
        return;
    }

    let books = getBooks();

    books.push({
        id: Date.now(),
        title: title,
        author: author,
        borrowedBy: ""
    });

    saveBooks(books);

    document.getElementById("bookTitle").value = "";
    document.getElementById("bookAuthor").value = "";

    showAdminBooks();
}

function showAdminBooks() {
    let current = JSON.parse(localStorage.getItem("currentUser"));

    if (!current || current.role !== "admin") {
        location.href = "index.html";
        return;
    }

    let books = getBooks();
    let output = "";

    books.forEach(book => {
        output += `<div class="book">
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Status: ${book.borrowedBy ? "Borrowed" : "Available"}</p>
            <button onclick="deleteBook(${book.id})">Delete</button>
        </div>`;
    });

    document.getElementById("adminBooks").innerHTML =
        output || "<p>No books added yet.</p>";
}

function deleteBook(id) {
    let current = JSON.parse(localStorage.getItem("currentUser"));

    if (!current || current.role !== "admin") {
        location.href = "index.html";
        return;
    }

    if (!confirm("Are you sure you want to delete this book?")) return;

    let books = getBooks().filter(book => book.id !== id);
    saveBooks(books);
    showAdminBooks();
}
