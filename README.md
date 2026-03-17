# 🥦 NutriTrack Pro

**Smart Nutrition Calculator** — Track your macros & hit your protein goal every day.

NutriTrack Pro is a modern, full-stack nutrition tracking web application built with **Next.js** and **TypeScript**. It provides an intuitive interface to calculate nutritional values, log daily food intake, and monitor progress toward your macro goals.

---

## ✨ Features

- **🔍 Smart Food Search** — Search from a built-in food database with auto-suggestions and category-based filtering
- **📊 Macro Tracking** — Track calories, protein, carbs, and fat with real-time progress bars
- **💪 Protein Goal Calculator** — Enter your body weight to get a personalized protein target (1.6× body weight)
- **📋 Food Log** — Add, edit, and remove food entries throughout the day
- **🔢 Multi-Unit Support** — Handles weight-based (g/kg), volume-based (ml/litre), and count-based (pieces) items
- **🎯 Daily Goal Progress** — Visual progress tracking for calorie and protein goals
- **⚡ Preview Mode** — Preview nutritional values before adding to your log
- **🎨 Premium UI** — Clean, modern light-theme design with smooth animations and glassmorphism effects
- **🌐 REST API** — Built-in Next.js API routes for food log management

---

## 🛠️ Tech Stack

| Layer          | Technology                       |
| -------------- | -------------------------------- |
| **Framework**  | Next.js 15 (App Router)          |
| **Language**   | TypeScript                       |
| **Frontend**   | React 19 with Inline Styles      |
| **Backend**    | Next.js API Routes               |
| **Styling**    | CSS-in-JS (Inline Styles)        |
| **Fonts**      | Geist Sans & Geist Mono          |
| **Storage**    | In-memory (API) + localStorage   |

---

## 📁 Project Structure

```
NutriTrack/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── food/
│   │   │       └── route.ts        # REST API (GET, POST, DELETE)
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout with metadata
│   │   └── page.tsx                # Home page
│   └── components/
│       └── App.tsx                 # Main application component
├── public/                         # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ashish13042/NutriTrack-Pro.git
   cd NutriTrack-Pro
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Endpoints

| Method   | Endpoint     | Description                  |
| -------- | ------------ | ---------------------------- |
| `GET`    | `/api/food`  | Fetch all logged food items  |
| `POST`   | `/api/food`  | Add a new food entry         |
| `DELETE` | `/api/food`  | Remove a food entry by ID    |

### Example — Add a food item

```bash
curl -X POST http://localhost:3000/api/food \
  -H "Content-Type: application/json" \
  -d '{"food": "chicken", "quantity": 200, "unit": "g", "calories": 330, "protein": 62, "carbs": 0, "fat": 7.2, "type": "weight"}'
```

---

## 🍽️ Supported Foods

| Category   | Foods                                           |
| ---------- | ----------------------------------------------- |
| **Protein** | Chicken, Egg, Tuna, Salmon, Beef, Paneer       |
| **Carbs**   | Rice, Bread, Oats, Pasta, Banana, Roti         |
| **Dairy**   | Milk, Yogurt                                   |
| **Fats**    | Almonds, Avocado, Peanut Butter                |
| **Veggies** | Spinach, Broccoli                              |
| **Fruits**  | Apple, Banana                                  |

> Nutrition data sourced from **USDA** — Per-piece for count items, per 100g/100ml otherwise.

---

## 📜 Available Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start development server           |
| `npm run build`   | Build for production               |
| `npm run start`   | Start production server            |
| `npm run lint`    | Run ESLint                         |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using Next.js & TypeScript
</p>
