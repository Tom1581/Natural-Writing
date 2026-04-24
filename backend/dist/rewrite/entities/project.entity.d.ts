import { ManuscriptEntity } from './manuscript.entity';
import { UserEntity } from './user.entity';
export declare class ProjectEntity {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    manuscripts: ManuscriptEntity[];
    owner: UserEntity;
}
