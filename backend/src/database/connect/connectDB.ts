import sequelize from "../../config/database";
import "../../models/incident"

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('connection successful');

        console.log('Registered models:', Object.keys(sequelize.models));
        console.log(sequelize.models);
        await sequelize.sync({ alter: true });
        console.log('sync database successful')
        return sequelize;
    } catch (error) {
        console.error('ERROR: connection unsuccessful', error);
        process.exit(1);
    }
}

export default connectDB;