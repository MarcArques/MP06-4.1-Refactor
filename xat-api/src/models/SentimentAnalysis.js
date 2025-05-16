const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SentimentAnalysis = sequelize.define('SentimentAnalysis', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sentiment: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['positive', 'neutral', 'negative']]
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = SentimentAnalysis;
