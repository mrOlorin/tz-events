"use strict";

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            "event",
            {
                id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4,
                },
                name: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    unique: true,
                },
                start_date: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                end_date: {
                    type: Sequelize.DATE,
                    allowNull: false,
                },
                created_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal("NOW()")
                },
                updated_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal("NOW()")
                },
            },
            {
                charset: "utf8",
            }
        );
    },
    down: function (queryInterface) {
        return queryInterface.dropTable("event");
    }
};
