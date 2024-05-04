import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'path/to/database.sqlite' // Provide the path to your SQLite database file
});