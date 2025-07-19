import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../config/database';

class Incident extends Model {
    declare id: number;
    declare userId: string;
    declare type: string;
    declare description: string;
    declare summary?: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    public static initModel(sequelize: Sequelize) {
        return this.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            summary: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            }
        },
    { sequelize, modelName: "incident", tableName: "incidents", timestamps: true });
    }
};

Incident.initModel(sequelize);

export default Incident;