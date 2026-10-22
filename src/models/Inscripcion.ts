import {
	Table,
	Column,
	Model,
	DataType,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import { Estudiante } from './Estudiante';
import { Curso } from './Curso';

@Table({ tableName: 'inscripciones', timestamps: false })
export class Inscripcion extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	declare id: string;

	@ForeignKey(() => Estudiante)
	@Column({ type: DataType.UUID, allowNull: false })
	estudiante_id!: string;

	@ForeignKey(() => Curso)
	@Column({ type: DataType.UUID, allowNull: false })
	curso_id!: string;

	@Column({ type: DataType.DATE, defaultValue: DataType.NOW })
	fecha_inscripcion!: Date;

	@Column({ type: DataType.DATE })
	fecha_finalizacion!: Date;

	@Column({
		type: DataType.TEXT,
		allowNull: false,
		defaultValue: 'activo', // <-- En minúscula para cumplir con la BD
		validate: {
			isIn: [['activo', 'completado', 'retirado']], // Ajusta según lo que permita tu base de datos
		},
	})
	estado_curso!: string;

	@Column({ type: DataType.TEXT })
	certificado_url!: string;

	// Relaciones
	@BelongsTo(() => Estudiante)
	estudiante!: Estudiante;

	@BelongsTo(() => Curso)
	curso!: Curso;
}
