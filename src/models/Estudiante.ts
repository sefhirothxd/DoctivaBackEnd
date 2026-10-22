import {
	Table,
	Column,
	Model,
	DataType,
	ForeignKey,
	BelongsTo,
	HasMany,
} from 'sequelize-typescript';
import { Usuario } from './Usuario';
import { Inscripcion } from './Inscripcion';

@Table({ tableName: 'estudiantes', timestamps: false })
export class Estudiante extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	declare id: string;

	@ForeignKey(() => Usuario)
	@Column({ type: DataType.UUID, allowNull: false })
	usuario_id!: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	nombres!: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	apellidos!: string;

	@Column({ type: DataType.TEXT })
	telefono!: string;

	@Column({ type: DataType.DATE, defaultValue: DataType.NOW })
	creado_en!: Date;

	// Relaciones
	@BelongsTo(() => Usuario)
	usuario!: Usuario;

	@HasMany(() => Inscripcion)
	inscripciones!: Inscripcion[];
}
