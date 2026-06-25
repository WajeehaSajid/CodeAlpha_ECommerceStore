# CodeAlpha E-Commerce Store 🛍️

A complete, production-ready **full-stack E-Commerce Store** built with a Node.js/Express
REST API, MongoDB, and a hand-crafted **vanilla HTML/CSS/JavaScript** frontend (no React,
no CSS frameworks). Features a stunning modern **dark theme** with glassmorphism, animated
product cards, toast notifications, JWT authentication, a shopping cart, checkout, order
history, and a full admin dashboard.

> Built for the **CodeAlpha** internship task.

---

## ✨ Features

- **JWT authentication** (register / login) with `bcryptjs` password hashing
- **Role-based access** — `user` and `admin`
- **Product catalog** with category filter, live search (debounced), sorting & pagination
- **Product detail** pages with star ratings, stock status & reviews
- **Shopping cart** — add / update quantity / remove / clear, animated cart badge
- **Checkout** with shipping form, free shipping over $50, order success screen
- **My Orders** — order history with color-coded status badges
- **Admin dashboard** — product CRUD (with image upload), order management, stats
- **Image uploads** via Multer
- **Toast notifications** on every action
- **Fully responsive** (4 → 2 → 1 column grid) with a full-page mobile menu

---

## 🧰 Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | HTML5, CSS3 (custom), Vanilla JavaScript (ES6+), `fetch()` |
| Backend   | Node.js, Express.js |
| Database  | MongoDB + Mongoose ODM |
| Auth      | JSON Web Tokens (JWT) + bcryptjs |
| Uploads   | Multer |
| Config    | dotenv |

---

## 📁 Project Structure

```
CodeAlpha_ECommerceStore/
├── backend/
│   ├── config/db.js
│   ├── models/        (User.js, Product.js, Order.js, Cart.js)
│   ├── routes/        (auth.js, products.js, cart.js, orders.js)
│   ├── middleware/    (auth.js — JWT verify + admin guard)
│   ├── uploads/       (product images)
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── index.html  product.html  cart.html  checkout.html
│   ├── login.html  register.html  orders.html  admin.html
│   ├── css/style.css
│   └── js/         (api.js, auth.js, products.js, cart.js, checkout.js, orders.js, admin.js)
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally **or** a MongoDB Atlas connection string

### Steps

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd CodeAlpha_ECommerceStore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/codealpha_ecommerce
   JWT_SECRET=your_long_random_secret
   JWT_EXPIRES_IN=7d
   ```

4. **(Optional) Start a local MongoDB with Docker**
   ```bash
   docker run -d --name ecom-mongo -p 27017:27017 mongo:7
   ```

5. **Seed the database** (creates an admin, a demo user & 10 products)
   ```bash
   npm run seed
   ```

6. **Run the server**
   ```bash
   npm start      # production
   npm run dev    # development (nodemon)
   ```

7. **Open the app** → <http://localhost:5000>

The Express server serves both the API (`/api/...`) and the static frontend, so a single
command runs the whole stack.

---

## 🌱 Seeding the Database

```bash
npm run seed
```

This wipes existing data and inserts:

| Account | Email | Password |
|---------|-------|----------|
| Admin   | `admin@store.com` | `admin123` |
| Customer| `user@store.com`  | `user123`  |

Plus **10 sample products** across Electronics, Clothing, Books, Accessories and Sports.

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register (name, email, password, role) → returns JWT |
| POST | `/login` | Public | Login → returns JWT + user |
| GET  | `/me` | Private | Get current user profile |

### Products — `/api/products`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | List products — `?category=&search=&sort=price_asc\|price_desc\|newest&page=&limit=` |
| GET | `/:id` | Public | Single product |
| POST | `/` | Admin | Create product (multipart, image upload) |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |
| POST | `/:id/reviews` | Private | Add / update a rating & review |

### Cart — `/api/cart` (all private)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get the user's cart |
| POST | `/add` | Add item `{ productId, quantity }` |
| PUT | `/update` | Update quantity `{ productId, quantity }` |
| DELETE | `/remove/:productId` | Remove an item |
| DELETE | `/clear` | Clear the cart |

### Orders — `/api/orders` (private)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Private | Place order from cart (saves shipping address, clears cart) |
| GET | `/myorders` | Private | Logged-in user's orders |
| GET | `/` | Admin | All orders |
| PUT | `/:id/status` | Admin | Update order status (`pending → processing → shipped → delivered`) |

---

## 🗃️ Data Models

- **User** — `{ name, email, password (hashed), role: ['user','admin'], createdAt }`
- **Product** — `{ name, description, price, category, stock, image, ratings: [{ user, rating, review }], avgRating, createdAt }`
- **Cart** — `{ user (ref), items: [{ product (ref), quantity }], updatedAt }`
- **Order** — `{ user (ref), items: [{ product (ref), quantity, priceAtPurchase }], totalAmount, shippingAddress: { name, street, city, country, zip }, status, createdAt }`

---

## 🎨 Design Tokens

| Token | Value |
|-------|-------|
| Background | `#0D0D0D` |
| Surface | `#1A1A2E` |
| Primary accent | `#E94560` |
| Secondary accent | `#F5A623` |
| Text primary | `#FFFFFF` |
| Text secondary | `#A0A0B0` |
| Border | `#2A2A3E` |
| Success | `#00C896` |

Fonts: **Outfit** (headings) + **Inter** (body) via Google Fonts.

---

## 📸 Screenshots

> _Add screenshots of the home page, product detail, cart, checkout and admin dashboard here._

| Home | Product Detail |
|------|----------------|
| _screenshot_ | _screenshot_ |

| Cart | Admin Dashboard |
|------|-----------------|
| _screenshot_ | _screenshot_ |

---

## 📝 License

This project is licensed under the **MIT License**.
