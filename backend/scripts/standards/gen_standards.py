import json, re, sys
R = sys.argv[1]; OUT = sys.argv[2]
S = {}

def add(id_, **kw):
    S[id_] = kw

# ─── US: Common Core State Standards for ELA (2010) ───
ccss = json.load(open(f'{R}/ccss.json'))
GRADE_LABEL = {'K': 'Kindergarten', '9-10': 'Grades 9–10', '11-12': 'Grades 11–12'}
for code, text in ccss.items():
    strand, g = code.split('.')[0], code.split('.')[1]
    num = int(code.split('.')[2])
    high = g in ('9-10', '11-12')
    if not (g == 'K' or high or 1 <= int(g) <= 8): continue
    # W.1–W.5 cover text types and the writing process; W.8 (using sources) is cited for 9–12 source-based tasks.
    if strand == 'W' and not (num <= 5 or (high and num == 8)): continue
    if strand == 'L' and num not in (1, 2, 3, 6): continue
    add(f'us-ccss:{code}', framework='us-ccss', code=f'CCSS.ELA-LITERACY.{code}'.upper().replace('ELA-LITERACY', 'ELA-Literacy'),
        shortCode=code, scope=GRADE_LABEL.get(g, f'Grade {g}'), text=text.rstrip('*').strip(),
        url=f'https://www.thecorestandards.org/ELA-Literacy/{strand}/{g}/')

# ─── Australia: Australian Curriculum v9.0 English ───
lines = open(f'{R}/acf6.txt').read().split('\n') + open(f'{R}/ac710.txt').read().split('\n')
for i, l in enumerate(lines):
    c = l.strip()
    m = re.match(r'^AC9E(F|10|[1-9])(L[AY])(\d\d)$', c)
    if not m: continue
    y = m.group(1)
    add(f'au-ac9:{c}', framework='au-ac9', code=c, shortCode=c, scope='Foundation' if y == 'F' else f'Year {y}', text=lines[i-1].strip(),
        url='https://www.australiancurriculum.edu.au/f-10-curriculum/learning-areas/english/' + ('foundation-year' if y == 'F' else f'year-{y}'))

# Senior Secondary Australian Curriculum: English (Version 8.4), "Create a range of texts". Copied from
# the ACARA content descriptions (Unit 1 and 2 = Year 11, Unit 4 = Year 12). States and territories
# deliver senior English through their own syllabuses, so these are cited as the national reference.
ACSS = 'https://v8.australiancurriculum.edu.au/senior-secondary-curriculum/english/english/'
SENIOR = {
 'ACEEN011': ('Year 11 (Unit 1)', 'using appropriate form, content, style and tone for different purposes and audiences in real and imagined contexts'),
 'ACEEN014': ('Year 11 (Unit 1)', 'using evidence-based argument'),
 'ACEEN015': ('Year 11 (Unit 1)', 'using appropriate quotation and referencing protocols'),
 'ACEEN016': ('Year 11 (Unit 1)', 'using strategies for planning, drafting, editing and proofreading'),
 'ACEEN017': ('Year 11 (Unit 1)', 'using accurate spelling, punctuation, syntax and metalanguage.'),
 'ACEEN032': ('Year 11 (Unit 2)', 'using imaginative, interpretive and persuasive elements for different purposes, contexts and audiences'),
 'ACEEN033': ('Year 11 (Unit 2)', 'experimenting with text structures, language features and multimodal devices'),
 'ACEEN034': ('Year 11 (Unit 2)', 'developing and sustaining voice, tone and style'),
 'ACEEN035': ('Year 11 (Unit 2)', 'selecting and applying appropriate textual evidence to support arguments'),
 'ACEEN069': ('Year 12 (Unit 4)', 'using appropriate language and stylistic features to sustain a personal voice and point of view'),
 'ACEEN070': ('Year 12 (Unit 4)', 'using nuanced language'),
 'ACEEN071': ('Year 12 (Unit 4)', 'synthesising ideas and opinions to develop complex argument'),
 'ACEEN072': ('Year 12 (Unit 4)', 'substantiating and justifying their own responses using textual evidence'),
 'ACEEN073': ('Year 12 (Unit 4)', 'using appropriate referencing, for example, footnotes, in-line citations and reference lists'),
 'ACEEN074': ('Year 12 (Unit 4)', 'using strategies for planning, drafting, editing and proofreading'),
 'ACEEN075': ('Year 12 (Unit 4)', 'using accurate spelling, punctuation, syntax and metalanguage.'),
}
for c, (scope, text) in SENIOR.items():
    add(f'au-ac9:{c}', framework='au-ac9', code=c, shortCode=c, scope=scope, title='Senior Secondary English: Create a range of texts', text=text, url=ACSS)

# ─── Canada: Ontario Language, Grades 1–8 (2023) ───
HEADINGS = ['Research', 'Organizing Content', 'Reflecting on Learning', 'Printing, Handwriting, and Word Processing', 'Voice',
            'Point of View and Perspective', 'Revision', 'Editing and Proofreading', 'Publishing and Presenting T exts',
            'Grammar', 'Capitalization and Punctuation', 'Developing Ideas']
TITLES = {'D1.1': 'Purpose and Audience', 'D1.2': 'Developing Ideas', 'D1.3': 'Research', 'D1.4': 'Organizing Content',
          'D1.5': 'Reflecting on Learning', 'D2.1': 'Producing Drafts', 'D2.3': 'Voice', 'D2.4': 'Point of View and Perspective',
          'D2.5': 'Revision', 'D2.6': 'Editing and Proofreading', 'B3.1': 'Syntax and Sentence Structure', 'B3.2': 'Grammar',
          'B3.3': 'Capitalization and Punctuation'}
def clean_on(s):
    s = re.sub(r'\s*\*\* For an at-a-glance.*$', '', s)
    s = re.sub(r'\s*©.*$', '', s)
    s = re.sub(r'\s*Expectations, Grades 1 to 8, 2023.*$', '', s)
    s = re.sub(r'\s*\d+ \| Strand [BD]\..*$', '', s)
    for h in HEADINGS:
        if s.endswith(' ' + h): s = s[: -len(h) - 1]
    s = re.sub(r'(\w)- (?!and\b)(\w)', r'\1-\2', s)
    return s.strip()
def parse_on(path, codes):
    t = open(path).read()
    t = re.sub(r'=== page \d+ ===', '', t)
    t = re.sub(r'Ontario Language Curriculum.*?\n', '', t)
    t = re.sub(r'SPECIFIC EXPECTATIONS \(continued\)|Grade 1 Grade 2 Grade 3 Grade 4 Grade 5 Grade 6 Grade 7 Grade 8', '', t)
    out = {}
    for c in codes:
        parts = re.split(r'(?<![\w.])' + re.escape(c) + r'\s', t)
        items = [re.split(r'(?<![\w.])[BD]\d\.\d\s|OVERALL EXPECTATION', re.sub(r'\s+', ' ', p))[0].strip() for p in parts[1:]]
        out[c] = [clean_on(i) for i in items]
    return out
onD = parse_on(f'{R}/on_strandD.txt', ['D1.1', 'D1.2', 'D1.3', 'D1.4', 'D2.1', 'D2.3', 'D2.4', 'D2.5'])
onB = parse_on(f'{R}/on_strandB.txt', ['B3.1', 'B3.2', 'B3.3'])
for c, items in {**onD, **onB}.items():
    assert len(items) == 8, (c, len(items))
    for g in range(1, 9):
        text = items[g - 1]
        if c == 'D2.5' and g == 8: text = ''   # column merged in the source PDF; cite by title only
        add(f'ca-on:{g}:{c}', framework='ca-on', code=c, shortCode=c, scope=f'Grade {g}', title=TITLES[c], text=text,
            url='https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language')
for g in range(1, 9):
    add(f'ca-on:{g}:D2.6', framework='ca-on', code='D2.6', shortCode='D2.6', scope=f'Grade {g}', title=TITLES['D2.6'], text='',
        url='https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language')
    add(f'ca-on:{g}:B2-vocabulary', framework='ca-on', code='B2', shortCode='B2', scope=f'Grade {g}', title='Language Foundations for Reading and Writing: Vocabulary', text='',
        url='https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language')

# Grade 9: English, Grade 9, De-streamed (ENL1W), 2023. Copied from the official PDF.
ENL1W = 'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-english/courses/enl1w'
ON9 = {
 'D1.1': ('Purpose and Audience', 'identify the topic, purpose, and audience for various texts they plan to create; choose a text form, genre, and medium to suit the purpose and audience, and justify their choices'),
 'D1.2': ('Developing Ideas', 'generate and develop ideas and details about complex topics, such as topics related to diversity, equity, and inclusion and to other subject areas, using a variety of strategies, and drawing on various resources, including their own lived experiences'),
 'D1.3': ('Research', 'gather and synthesize information and content relevant to a topic, using a variety of textual sources and appropriate strategies; evaluate the currency, quality, bias, and accuracy of information; verify the reliability of sources; and check copyright and cite the sources for all content created by others'),
 'D1.4': ('Organizing Content', 'classify and sequence ideas and collected information, selecting effective strategies and tools, and identify and organize relevant content, evaluating the choices of text form, genre, and medium, and considering alternatives'),
 'D2.1': ('Producing Drafts', 'draft complex texts of various forms and genres, including narrative, persuasive, expository, and informational texts, citing sources, and use a variety of appropriate media, tools, and strategies to transform information and communicate ideas'),
 'D2.3': ('Voice', 'establish an identifiable voice in their texts, modifying language, style, and tone to suit the text’s form, genre, audience, and purpose, and express their thoughts, feelings, and opinions about the topic clearly'),
 'D2.4': ('Point of View and Perspective', 'explain the explicit and implicit points of view, perspectives, and bias conveyed in their texts, evaluate how various audiences might respond, and suggest ways to acknowledge other perspectives'),
 'D2.5': ('Revision', 'make revisions to the content, elements of style, patterns, and features of draft texts, and add, delete, revise, and reorganize sentences to improve clarity, focus, and coherence, using various strategies and seeking and selectively using feedback'),
 'D2.6': ('Editing and Proofreading', 'edit draft texts to improve accuracy and style, checking for errors in spelling, punctuation, grammar, and format; edit digital texts using word-processing software, including spell- and grammar-checkers'),
 'B3.1': ('Syntax and Sentence Structure', 'use their knowledge of sentence types and forms to construct complex sentences that connect and communicate ideas accurately and effectively'),
 'B3.2': ('Grammar', 'demonstrate an understanding of the functions of parts of speech in sentences, consolidate and refine their understanding of grammar, and use this knowledge to support comprehension and communicate meaning clearly and precisely'),
 'B3.3': ('Capitalization and Punctuation', 'use and refine their understanding of the meaning and function of capitalization and punctuation to communicate meaning clearly and coherently, when reading and writing'),
}
for c, (title, text) in ON9.items():
    add(f'ca-on:9:{c}', framework='ca-on', code=c, shortCode=c, scope='Grade 9 (ENL1W)', title=title, text=text, url=ENL1W)

# Grades 10–12: The Ontario Curriculum, English (2007), Writing strand, university-preparation courses.
# Extracted by on2007.py; the examples and teacher prompts in parentheses are left out.
ON2007_TITLES = {'1.1': 'Identifying Topic, Purpose, and Audience', '1.2': 'Generating and Developing Ideas', '1.3': 'Research',
                 '1.4': 'Organizing Ideas', '1.5': 'Reviewing Content', '2.1': 'Form', '2.2': 'Voice', '2.3': 'Diction',
                 '2.4': 'Sentence Craft and Fluency', '2.6': 'Revision', '3.1': 'Spelling', '3.3': 'Punctuation', '3.4': 'Grammar',
                 '3.5': 'Proofreading', '4.1': 'Metacognition'}
ON2007_URL = {'ENG2D': 'https://www.edu.gov.on.ca/eng/curriculum/secondary/english910currb.pdf',
              'ENG3U': 'https://www.edu.gov.on.ca/eng/curriculum/secondary/english1112currb.pdf',
              'ENG4U': 'https://www.edu.gov.on.ca/eng/curriculum/secondary/english1112currb.pdf'}
on2007 = json.load(open(f'{R}/on2007.json'))
for g, course in ((10, 'ENG2D'), (11, 'ENG3U'), (12, 'ENG4U')):
    for c, title in ON2007_TITLES.items():
        add(f'ca-on:{g}:W{c}', framework='ca-on', code=f'Writing {c}', shortCode=f'W{c}', scope=f'Grade {g} ({course})', title=title,
            text=on2007[course][c], url=ON2007_URL[course])

# ─── England: National Curriculum English programmes of study (2013) and KS2 TAF (2018) ───
NC_PRIMARY = 'https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study'
TAF = 'https://www.gov.uk/government/publications/teacher-assessment-frameworks-at-the-end-of-key-stage-2'
ENG = {
 'lks2.plan-ideas': ('Years 3–4', 'Writing – composition', 'plan their writing by: discussing and recording ideas'),
 'lks2.vocab-sentences': ('Years 3–4', 'Writing – composition', 'draft and write by: composing and rehearsing sentences orally (including dialogue), progressively building a varied and rich vocabulary and an increasing range of sentence structures (English Appendix 2)'),
 'lks2.paragraphs': ('Years 3–4', 'Writing – composition', 'draft and write by: organising paragraphs around a theme'),
 'lks2.narrative': ('Years 3–4', 'Writing – composition', 'draft and write by: in narratives, creating settings, characters and plot'),
 'lks2.non-narrative': ('Years 3–4', 'Writing – composition', 'draft and write by: in non-narrative material, using simple organisational devices [for example, headings and sub-headings]'),
 'lks2.evaluate': ('Years 3–4', 'Writing – composition', 'evaluate and edit by: assessing the effectiveness of their own and others’ writing and suggesting improvements'),
 'lks2.proofread': ('Years 3–4', 'Writing – composition', 'proof-read for spelling and punctuation errors'),
 'lks2.conjunctions': ('Years 3–4', 'Writing – vocabulary, grammar and punctuation', 'extending the range of sentences with more than one clause by using a wider range of conjunctions, including when, if, because, although'),
 'lks2.nouns-pronouns': ('Years 3–4', 'Writing – vocabulary, grammar and punctuation', 'choosing nouns or pronouns appropriately for clarity and cohesion and to avoid repetition'),
 'lks2.time-cause': ('Years 3–4', 'Writing – vocabulary, grammar and punctuation', 'using conjunctions, adverbs and prepositions to express time and cause'),
 'lks2.fronted-adverbials': ('Years 3–4', 'Writing – vocabulary, grammar and punctuation', 'using fronted adverbials'),
 'lks2.punctuation': ('Years 3–4', 'Writing – vocabulary, grammar and punctuation', 'indicate grammatical and other features by: using commas after fronted adverbials; indicating possession by using the possessive apostrophe with plural nouns; using and punctuating direct speech'),
 'uks2.audience-purpose': ('Years 5–6', 'Writing – composition', 'plan their writing by: identifying the audience for and purpose of the writing, selecting the appropriate form and using other similar writing as models for their own'),
 'uks2.ideas': ('Years 5–6', 'Writing – composition', 'plan their writing by: noting and developing initial ideas, drawing on reading and research where necessary'),
 'uks2.grammar-vocab': ('Years 5–6', 'Writing – composition', 'draft and write by: selecting appropriate grammar and vocabulary, understanding how such choices can change and enhance meaning'),
 'uks2.narrative': ('Years 5–6', 'Writing – composition', 'draft and write by: in narratives, describing settings, characters and atmosphere and integrating dialogue to convey character and advance the action'),
 'uks2.cohesion': ('Years 5–6', 'Writing – composition', 'draft and write by: using a wide range of devices to build cohesion within and across paragraphs'),
 'uks2.organisational': ('Years 5–6', 'Writing – composition', 'draft and write by: using further organisational and presentational devices to structure text and to guide the reader [for example, headings, bullet points, underlining]'),
 'uks2.evaluate': ('Years 5–6', 'Writing – composition', 'evaluate and edit by: proposing changes to vocabulary, grammar and punctuation to enhance effects and clarify meaning'),
 'uks2.tense': ('Years 5–6', 'Writing – composition', 'evaluate and edit by: ensuring the consistent and correct use of tense throughout a piece of writing'),
 'uks2.agreement-register': ('Years 5–6', 'Writing – composition', 'evaluate and edit by: ensuring correct subject and verb agreement when using singular and plural, distinguishing between the language of speech and writing and choosing the appropriate register'),
 'uks2.proofread': ('Years 5–6', 'Writing – composition', 'proof-read for spelling and punctuation errors'),
 'uks2.modal': ('Years 5–6', 'Writing – vocabulary, grammar and punctuation', 'using modal verbs or adverbs to indicate degrees of possibility'),
 'uks2.relative-clauses': ('Years 5–6', 'Writing – vocabulary, grammar and punctuation', 'using relative clauses beginning with who, which, where, when, whose, that or with an implied (i.e. omitted) relative pronoun'),
 'uks2.commas': ('Years 5–6', 'Writing – vocabulary, grammar and punctuation', 'using commas to clarify meaning or avoid ambiguity in writing'),
 'taf.exs.purpose': ('End of key stage 2 (Year 6)', 'Teacher assessment framework: working at the expected standard', 'write effectively for a range of purposes and audiences, selecting language that shows good awareness of the reader (e.g. the use of the first person in a diary; direct address in instructions and persuasive writing)'),
 'taf.exs.narrative': ('End of key stage 2 (Year 6)', 'Teacher assessment framework: working at the expected standard', 'in narratives, describe settings, characters and atmosphere'),
 'taf.exs.dialogue': ('End of key stage 2 (Year 6)', 'Teacher assessment framework: working at the expected standard', 'integrate dialogue in narratives to convey character and advance the action'),
 'taf.exs.vocab-grammar': ('End of key stage 2 (Year 6)', 'Teacher assessment framework: working at the expected standard', 'select vocabulary and grammatical structures that reflect what the writing requires, doing this mostly appropriately (e.g. using contracted forms in dialogues in narrative; using passive verbs to affect how information is presented; using modal verbs to suggest degrees of possibility)'),
 'taf.exs.cohesion': ('End of key stage 2 (Year 6)', 'Teacher assessment framework: working at the expected standard', 'use a range of devices to build cohesion (e.g. conjunctions, adverbials of time and place, pronouns, synonyms) within and across paragraphs'),
 'taf.exs.tense': ('End of key stage 2 (Year 6)', 'Teacher assessment framework: working at the expected standard', 'use verb tenses consistently and correctly throughout their writing'),
 'taf.exs.punctuation': ('End of key stage 2 (Year 6)', 'Teacher assessment framework: working at the expected standard', 'use the range of punctuation taught at key stage 2 mostly correctly^ (e.g. inverted commas and other punctuation to indicate direct speech)'),
 'taf.exs.spelling': ('End of key stage 2 (Year 6)', 'Teacher assessment framework: working at the expected standard', 'spell correctly most words from the year 5 / year 6 spelling list,* and use a dictionary to check the spelling of uncommon or more ambitious vocabulary'),
 'taf.gds.register': ('End of key stage 2 (Year 6)', 'Teacher assessment framework: working at greater depth', 'distinguish between the language of speech and writing and choose the appropriate register'),
 'ks3.forms': ('Key stage 3 (Years 7–9)', 'Writing', 'writing for a wide range of purposes and audiences, including: well-structured formal expository and narrative essays; stories, scripts, poetry and other imaginative writing; notes and polished scripts for talks and presentations; a range of other narrative and non-narrative texts, including arguments, and personal and formal letters'),
 'ks3.summarising': ('Key stage 3 (Years 7–9)', 'Writing', 'summarising and organising material, and supporting ideas and arguments with any necessary factual detail'),
 'ks3.knowledge': ('Key stage 3 (Years 7–9)', 'Writing', 'applying their growing knowledge of vocabulary, grammar and text structure to their writing and selecting the appropriate form'),
 'ks3.devices': ('Key stage 3 (Years 7–9)', 'Writing', 'drawing on knowledge of literary and rhetorical devices from their reading and listening to enhance the impact of their writing'),
 'ks3.audience': ('Key stage 3 (Years 7–9)', 'Writing', 'plan, draft, edit and proof-read through: considering how their writing reflects the audiences and purposes for which it was intended'),
 'ks3.amending': ('Key stage 3 (Years 7–9)', 'Writing', 'plan, draft, edit and proof-read through: amending the vocabulary, grammar and structure of their writing to improve its coherence and overall effectiveness'),
 'ks3.accuracy': ('Key stage 3 (Years 7–9)', 'Writing', 'plan, draft, edit and proof-read through: paying attention to accurate grammar, punctuation and spelling; applying the spelling patterns and rules set out in English Appendix 1 to the key stage 1 and 2 programmes of study for English'),
 'ks3.registers': ('Key stage 3 (Years 7–9)', 'Grammar and vocabulary', 'knowing and understanding the differences between spoken and written language, including differences associated with formal and informal registers, and between Standard English and other varieties of English'),
 'ks3.standard-english': ('Key stage 3 (Years 7–9)', 'Grammar and vocabulary', 'using Standard English confidently in their own writing and speech'),
 'ks3.new-vocab': ('Key stage 3 (Years 7–9)', 'Grammar and vocabulary', 'drawing on new vocabulary and grammatical constructions from their reading and listening, and using these consciously in their writing and speech to achieve particular effects'),

 'y1.say-aloud': ('Year 1', 'Writing – composition', 'write sentences by: saying out loud what they are going to write about'),
 'y1.compose-orally': ('Year 1', 'Writing – composition', 'write sentences by: composing a sentence orally before writing it'),
 'y1.sequence': ('Year 1', 'Writing – composition', 'write sentences by: sequencing sentences to form short narratives'),
 'y1.reread': ('Year 1', 'Writing – composition', 'write sentences by: re-reading what they have written to check that it makes sense'),
 'y1.discuss': ('Year 1', 'Writing – composition', 'discuss what they have written with the teacher or other pupils'),
 'y1.and': ('Year 1', 'Writing – vocabulary, grammar and punctuation', 'develop their understanding of the concepts set out in English Appendix 2 by: joining words and joining clauses using and'),
 'y1.punctuate': ('Year 1', 'Writing – vocabulary, grammar and punctuation', 'develop their understanding of the concepts set out in English Appendix 2 by: beginning to punctuate sentences using a capital letter and a full stop, question mark or exclamation mark'),
 'y1.capitals': ('Year 1', 'Writing – vocabulary, grammar and punctuation', 'develop their understanding of the concepts set out in English Appendix 2 by: using a capital letter for names of people, places, the days of the week, and the personal pronoun ‘I’'),
 'y2.narratives': ('Year 2', 'Writing – composition', 'develop positive attitudes towards and stamina for writing by: writing narratives about personal experiences and those of others (real and fictional)'),
 'y2.real-events': ('Year 2', 'Writing – composition', 'develop positive attitudes towards and stamina for writing by: writing about real events'),
 'y2.purposes': ('Year 2', 'Writing – composition', 'develop positive attitudes towards and stamina for writing by: writing for different purposes'),
 'y2.plan': ('Year 2', 'Writing – composition', 'consider what they are going to write before beginning by: planning or saying out loud what they are going to write about'),
 'y2.ideas': ('Year 2', 'Writing – composition', 'consider what they are going to write before beginning by: writing down ideas and/or key words, including new vocabulary'),
 'y2.sentence-by-sentence': ('Year 2', 'Writing – composition', 'consider what they are going to write before beginning by: encapsulating what they want to say, sentence by sentence'),
 'y2.evaluate': ('Year 2', 'Writing – composition', 'make simple additions, revisions and corrections to their own writing by: evaluating their writing with the teacher and other pupils'),
 'y2.proofread': ('Year 2', 'Writing – composition', 'make simple additions, revisions and corrections to their own writing by: proof-reading to check for errors in spelling, grammar and punctuation [for example, ends of sentences punctuated correctly]'),
 'y2.punctuation': ('Year 2', 'Writing – vocabulary, grammar and punctuation', 'develop their understanding of the concepts set out in English Appendix 2 by: learning how to use both familiar and new punctuation correctly (see English Appendix 2), including full stops, capital letters, exclamation marks, question marks, commas for lists and apostrophes for contracted forms and the possessive (singular)'),
 'y2.noun-phrases': ('Year 2', 'Writing – vocabulary, grammar and punctuation', 'learn how to use: expanded noun phrases to describe and specify [for example, the blue butterfly]'),
 'y2.subordination': ('Year 2', 'Writing – vocabulary, grammar and punctuation', 'learn how to use: subordination (using when, if, that, or because) and co-ordination (using or, and, or but)'),
 'ks4.purposes': ('Key stage 4 (Years 10–11)', 'Writing', 'write accurately, fluently, effectively and at length for pleasure and information through: adapting their writing for a wide range of purposes and audiences: to describe, narrate, explain, instruct, give and respond to information, and argue'),
 'ks4.evidence': ('Key stage 4 (Years 10–11)', 'Writing', 'write accurately, fluently, effectively and at length for pleasure and information through: selecting and organising ideas, facts and key points, and citing evidence, details and quotation effectively and pertinently for support and emphasis'),
 'ks4.choices': ('Key stage 4 (Years 10–11)', 'Writing', 'write accurately, fluently, effectively and at length for pleasure and information through: selecting, and using judiciously, vocabulary, grammar, form, and structural and organisational features, including rhetorical devices, to reflect audience, purpose and context, and using Standard English where appropriate'),
 'ks4.notes': ('Key stage 4 (Years 10–11)', 'Writing', 'make notes, draft and write, including using information provided by others [e.g. writing a letter from key points provided; drawing on and using information from a presentation]'),
 'ks4.impact': ('Key stage 4 (Years 10–11)', 'Writing', 'revise, edit and proof-read through: reflecting on whether their draft achieves the intended impact'),
 'ks4.restructuring': ('Key stage 4 (Years 10–11)', 'Writing', 'revise, edit and proof-read through: restructuring their writing, and amending its grammar and vocabulary to improve coherence, consistency, clarity and overall effectiveness'),
 'ks4.accuracy': ('Key stage 4 (Years 10–11)', 'Writing', 'revise, edit and proof-read through: paying attention to the accuracy and effectiveness of grammar, punctuation and spelling.'),
 'ks4.new-vocab': ('Key stage 4 (Years 10–11)', 'Grammar and vocabulary', 'consolidate and build on their knowledge of grammar and vocabulary through: drawing on new vocabulary and grammatical constructions from their reading and listening, and using these consciously in their writing and speech to achieve particular effects'),
}
KS4 = 'https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study'
for k, (scope, section, text) in ENG.items():
    add(f'uk-eng:{k}', framework='uk-eng', code=section, shortCode=k, scope=scope, text=text, url=TAF if k.startswith('taf') else NC_PRIMARY)

with open(OUT, 'w') as f:
    f.write('/* eslint-disable */\n')
    f.write('// GENERATED by backend/scripts/standards (see README.md there) from the official documents listed in\n')
    f.write('// FRAMEWORKS (frameworks.ts). Texts are verbatim; do not edit by hand. An empty `text`\n')
    f.write('// means the statement is cited by code and title only.\n\n')
    f.write("import type { StandardStatement } from './frameworks';\n\n")
    f.write('export const STANDARD_STATEMENTS: Record<string, StandardStatement> = ')
    f.write(json.dumps(S, ensure_ascii=False, indent=2, sort_keys=True))
    f.write(';\n')
print(len(S), 'statements')
