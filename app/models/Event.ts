import {
    Table, Column, Model, PrimaryKey, CreatedAt, UpdatedAt, IsUUID, Default, Scopes,
} from "sequelize-typescript";
import * as uuid from "uuid";

@Scopes({
    view: () => ({
        attributes: [
            "id", "name", "startDate", "endDate", "createdAt",
        ],
    }),
})
@Table({
    timestamps: true,
    tableName: "event",
})
export default class Event extends Model<Event> {

    @IsUUID(4)
    @Default(uuid.v4)
    @PrimaryKey
    @Column
    public id: string;

    @Column
    public name: string;

    @Column({field: "start_date"})
    public startDate: Date;

    @Column({field: "end_date"})
    public endDate: Date;

    @CreatedAt
    @Column({field: "created_at"})
    public createdAt: Date;

    @UpdatedAt
    @Column({field: "updated_at"})
    public updatedAt: Date;

}
