import {
	Table,
	Column,
	Model,
	DataType,
	HasMany,
	BelongsToMany,
} from 'sequelize-typescript';
import { Inscripcion } from './Inscripcion';
import { Recurso } from './Recurso';
import { RecursoCurso } from './RecursoCurso';

@Table({ tableName: 'cursos', timestamps: false })
export class Curso extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	declare id: string;

	@Column({ type: DataType.TEXT, allowNull: false, unique: true })
	codigo!: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	nombre!: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	docente_nombre!: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	modalidad!: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	horario!: string;

	@Column({ type: DataType.TEXT })
	aula!: string;

	@Column({ type: DataType.TEXT })
	descripcion!: string;

	@Column({ type: DataType.DATE, defaultValue: DataType.NOW })
	creado_en!: Date;

	// Relaciones
	@HasMany(() => Inscripcion)
	inscripciones!: Inscripcion[];

	@BelongsToMany(() => Recurso, () => RecursoCurso)
	recursos!: Recurso[];
}
