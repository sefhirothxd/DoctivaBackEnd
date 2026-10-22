import { Table, Column, Model, DataType, HasOne } from 'sequelize-typescript';
import { Estudiante } from './Estudiante';

@Table({ tableName: 'usuarios', timestamps: false })
export class Usuario extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	declare id: string;

	@Column({ type: DataType.TEXT, allowNull: false, unique: true })
	declare email: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare password_hash: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare rol: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	declare estado: string;

	@Column({ type: DataType.DATE })
	declare ultimo_acceso: Date;

	@Column({ type: DataType.DATE, defaultValue: DataType.NOW })
	declare creado_en: Date;

	@HasOne(() => Estudiante)
	declare estudiante: Estudiante;
}
