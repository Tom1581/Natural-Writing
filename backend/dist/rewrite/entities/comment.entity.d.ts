import { ManuscriptEntity } from './manuscript.entity';
export declare class CommentEntity {
    id: string;
    content: string;
    selectionData: {
        from: number;
        to: number;
        text: string;
    };
    authorName: string;
    isResolved: boolean;
    createdAt: Date;
    manuscript: ManuscriptEntity;
}
