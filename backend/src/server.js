const dns = require('dns');
dns.setServers(['1.1.1.1','8.8.8.8']);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const seedAdmin = require("./config/seedAdmin");

const authRoutes = require("./routes/auth.routes");
const ideaRoutes = require("./routes/idea.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const winnerRoutes = require("./routes/winner.routes");

const finalizeWeeklyWinners = require("./utils/finalizeWeeklyWinners");
const { getPreviousWeekLabel } = require("./utils/weekLabel");

const {
  notFound,
  errorHandler,
} = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());

const configuredClientOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...configuredClientOrigins,
  "http://localhost:3000"
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(morgan("dev")); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Idea Sharing Platform API is running",
  });
});

app.use("/auth", authRoutes);
app.use("/ideas", ideaRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/winners", winnerRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();

    const previousWeek = getPreviousWeekLabel();
    await finalizeWeeklyWinners(previousWeek);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
