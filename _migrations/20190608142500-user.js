"use strict";

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.createTable(
            "user",
            {
                id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: Sequelize.UUIDV4,
                },
                email: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
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
        return queryInterface.dropTable("user");
    }
};
