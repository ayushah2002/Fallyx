import { Sequelize } from "sequelize";

const sequelize = new Sequelize("fallyx", "postgres", "test_2025", {
    host: "localhost",
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: "postgres",
    logging: false,
});

export default sequelize;