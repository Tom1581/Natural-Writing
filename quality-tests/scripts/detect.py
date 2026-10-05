"""Score texts with two open-source AI-text detectors (proxies for GPTZero).

Usage: python detect.py file1.txt [file2.txt ...]
Prints, per file and detector, the word-weighted AI probability and the share
of chunks classified as AI (probability >= 0.5).
"""
import json
import re
import sys

import torch
import torch.nn as nn
from transformers import (AutoConfig, AutoModel,
                          AutoModelForSequenceClassification, AutoTokenizer,
                          PreTrainedModel)

DEVICE = torch.device('mps' if torch.backends.mps.is_available() else 'cpu')


class DesklibAIDetectionModel(PreTrainedModel):
    """Architecture from the desklib/ai-text-detector-v1.01 model card."""
    config_class = AutoConfig

    def __init__(self, config):
        super().__init__(config)
        self.model = AutoModel.from_config(config)
        self.classifier = nn.Linear(config.hidden_size, 1)
        self.init_weights()

    def forward(self, input_ids, attention_mask=None):
        hidden = self.model(input_ids, attention_mask=attention_mask)[0]
        mask = attention_mask.unsqueeze(-1).expand(hidden.size()).float()
        pooled = (hidden * mask).sum(1) / mask.sum(1).clamp(min=1e-9)
        return self.classifier(pooled)


def prose_only(text):
    """Drop title lines, headings, tables, and the reference list."""
    text = re.split(r'\n\s*(?:References|Bibliography|Works Cited)\s*\n', text)[0]
    kept = []
    for line in text.split('\n'):
        line = line.strip()
        if not line or line.count('|') >= 2:
            continue
        if len(line.split()) <= 12 and not re.search(r'[.!?:]$', line):
            continue
        kept.append(line)
    return '\n\n'.join(kept)


def chunks(text, target=220, limit=300):
    """Paragraph-aware chunks of roughly `target` words, none over `limit`."""
    pieces = []
    for para in text.split('\n\n'):
        words = para.split()
        if len(words) <= limit:
            pieces.append(para)
            continue
        sentences = re.split(r'(?<=[.!?])\s+', para)
        cur = []
        for s in sentences:
            cur.append(s)
            if len(' '.join(cur).split()) >= target:
                pieces.append(' '.join(cur))
                cur = []
        if cur:
            pieces.append(' '.join(cur))
    out, cur = [], []
    for p in pieces:
        cur.append(p)
        if len(' '.join(cur).split()) >= target:
            out.append('\n\n'.join(cur))
            cur = []
    if cur:
        if out and len(' '.join(cur).split()) < 60:
            out[-1] += '\n\n' + '\n\n'.join(cur)
        else:
            out.append('\n\n'.join(cur))
    return out


def load():
    fs_tok = AutoTokenizer.from_pretrained('fakespot-ai/roberta-base-ai-text-detection-v1')
    fs_model = AutoModelForSequenceClassification.from_pretrained(
        'fakespot-ai/roberta-base-ai-text-detection-v1').to(DEVICE).eval()
    labels = {v.lower(): int(k) for k, v in fs_model.config.id2label.items()}
    ai_index = next(i for name, i in labels.items() if 'ai' in name or 'machine' in name or 'fake' in name)

    dk_tok = AutoTokenizer.from_pretrained('desklib/ai-text-detector-v1.01')
    dk_model = DesklibAIDetectionModel.from_pretrained('desklib/ai-text-detector-v1.01').to(DEVICE).eval()

    def fakespot(text):
        enc = fs_tok(text, truncation=True, max_length=512, return_tensors='pt').to(DEVICE)
        with torch.no_grad():
            probs = torch.softmax(fs_model(**enc).logits, dim=-1)[0]
        return probs[ai_index].item()

    def desklib(text):
        enc = dk_tok(text, truncation=True, max_length=512, return_tensors='pt').to(DEVICE)
        with torch.no_grad():
            logit = dk_model(enc['input_ids'], attention_mask=enc['attention_mask'])
        return torch.sigmoid(logit).item()

    return {'fakespot': fakespot, 'desklib': desklib}, fs_model.config.id2label


def score(detectors, text):
    parts = chunks(prose_only(text))
    result = {}
    for name, fn in detectors.items():
        probs = [fn(p) for p in parts]
        weights = [len(p.split()) for p in parts]
        doc = sum(p * w for p, w in zip(probs, weights)) / max(sum(weights), 1)
        result[name] = {
            'ai_probability': round(doc, 3),
            'ai_chunks': f"{sum(p >= 0.5 for p in probs)}/{len(probs)}",
            'chunks': [round(p, 2) for p in probs],
        }
    return result


if __name__ == '__main__':
    detectors, labels = load()
    print(json.dumps({'fakespot_labels': labels, 'device': str(DEVICE)}), file=sys.stderr)
    for path in sys.argv[1:]:
        with open(path, encoding='utf-8') as f:
            r = score(detectors, f.read())
        print(json.dumps({'file': path.split('/')[-1], **r}))
