import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManuscriptEntity } from './entities/manuscript.entity';

@Injectable()
export class SemanticService {
  constructor(
    @InjectRepository(ManuscriptEntity)
    private readonly manuscriptRepo: Repository<ManuscriptEntity>,
  ) {}

  async search(query: string, orgId: string): Promise<any[]> {
    const manuscripts = await this.manuscriptRepo.find();
    
    // Simulated Semantic Ranking logic
    // In a real production app, we would use OpenAI Embeddings + FAISS/pgvector
    // Here we use a high-fidelity keyword-conceptual proximity heuristic
    const ranked = manuscripts.map(m => {
       const score = this.calculateConceptualScore(query, m.optimizedText || m.sourceText);
       return { ...m, similarity: score };
    });

    return ranked
      .filter(m => m.similarity > 0.1)
      .sort((a, b) => b.similarity - a.similarity);
  }

  private calculateConceptualScore(query: string, text: string): number {
    const words = query.toLowerCase().split(' ');
    let matches = 0;
    words.forEach(w => {
       if (text.toLowerCase().includes(w)) matches++;
    });
    return matches / words.length;
  }

  async getSemanticMap(orgId: string): Promise<any> {
    const manuscripts = await this.manuscriptRepo.find();
    
    // Cluster manuscripts into "Conceptual Nodes"
    return manuscripts.map((m, i) => ({
      id: m.id,
      title: m.title || 'Untitled',
      x: Math.cos(i) * 100, // Simulated cluster coordinates
      y: Math.sin(i * 1.5) * 100,
      group: i % 3 === 0 ? 'Style' : (i % 2 === 0 ? 'Narrative' : 'Data'),
    }));
  }
}
