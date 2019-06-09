import {
    Table, Column, Model, PrimaryKey, CreatedAt, UpdatedAt, IsUUID, Default, Scopes, DefaultScope,
} from "sequelize-typescript";
import * as uuid from "uuid";

@DefaultScope(() => ({
    exclude: ["password"]
}))
@Scopes({
    view: () => ({
        attributes: [
            "id", "email", "createdAt",
        ],
    }),
})
@Table({
    timestamps: true,
    tableName: "user",
})
export default class User extends Model<User> {

    @IsUUID(4)
    @Default(uuid.v4)
    @PrimaryKey
    @Column
    public id: string;

    @Column
    public email: string;

    @Column
    public password: string;

    @CreatedAt
    @Column({field: "created_at"})
    public createdAt: Date;

    @UpdatedAt
    @Column({field: "updated_at"})
    public updatedAt: Date;

}
