import { Injectable } from '@nestjs/common';

@Injectable()
export class RhythmService {
  async analyzeCadence(text: string): Promise<any> {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Map sentence lengths to a "Pulse Map"
    const pulseMap = sentences.map((s, i) => {
       const length = s.trim().split(/\s+/).length;
       return {
          id: i,
          length,
          type: length < 10 ? 'staccato' : (length > 25 ? 'lyrical' : 'standard'),
          text: s.trim().substring(0, 30) + '...'
       };
    });

    const averageLength = pulseMap.reduce((acc, curr) => acc + curr.length, 0) / pulseMap.length;
    const variance = pulseMap.reduce((acc, curr) => acc + Math.pow(curr.length - averageLength, 2), 0) / pulseMap.length;

    return {
       pulseMap,
       metrics: {
          averageLength: Math.round(averageLength),
          rhythmicVariety: Math.round(Math.sqrt(variance) * 10) / 10,
          status: variance > 50 ? 'Dynamic' : (variance < 10 ? 'Monotone' : 'Balanced')
       }
    };
  }
}
