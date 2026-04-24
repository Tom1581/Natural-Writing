import { ManuscriptEntity } from './manuscript.entity';
export declare class VersionEntity {
    id: string;
    content: string;
    metrics: any;
    label: string;
    createdAt: Date;
    manuscript: ManuscriptEntity;
}
