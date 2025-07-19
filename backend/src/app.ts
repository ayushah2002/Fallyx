import express from "express";
import router from "./routes";
import cors from "cors";

const app = express();
  
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
  }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.get('/', (req, res) => {
    res.send('Backend is running!');
});


export default app;
