import {
  checkRewrite,
  cleanModelOutput,
  CompleteFn,
  expandContractions,
  extractInvariants,
  findTells,
  humanizeDocument,
  HumanizerUnavailableError,
  normalizeTypography,
  polish,
  segmentDocument,
  stripHtml,
  extractKeyTerms,
  looksAcademic,
} from './humanizer';

const PAPER = `The Impact of Social Media on Adolescent Mental Health

In today's digital age, social media has become an integral part of adolescent life. Research has shown that excessive use is associated with anxiety and depression (Twenge et al., 2018).

Furthermore, a 2019 study found that teens who spent more than 3 hours per day on social media faced double the risk of poor mental health outcomes (Riehm et al., 2019).

References
Riehm, K. E., et al. (2019). Associations between time spent using social media. JAMA Psychiatry, 76(12), 1266-1273.
Twenge, J. M., et al. (2018). Increases in depressive symptoms. Clinical Psychological Science, 6(1), 3-17.`;

const settings = { tone: 'academic', strength: 'medium', humanization: 0.8 };

const paragraphOf = (user: string) =>
  user.match(/<paragraph>\n([\s\S]*?)\n<\/paragraph>/)![1];

describe('segmentDocument', () => {
  it('keeps the title and reference list verbatim and rewrites only body paragraphs', () => {
    const blocks = segmentDocument(PAPER);
    expect(blocks.map((b) => b.kind)).toEqual([
      'verbatim',
      'prose',
      'prose',
      'verbatim',
    ]);
    expect(blocks[3].text.startsWith('References\nRiehm')).toBe(true);
  });

  it('treats single-newline input as one paragraph per line', () => {
    const blocks = segmentDocument(
      'Introduction\nThe first paragraph has enough words to be rewritten here.\nThe second paragraph also has enough words to be rewritten.',
    );
    expect(blocks.map((b) => [b.kind, b.sep])).toEqual([
      ['verbatim', ''],
      ['prose', '\n'],
      ['prose', '\n'],
    ]);
  });

  it('splits a lead-in line from its list and keeps short items as written', () => {
    const blocks = segmentDocument(
      'Key strategies include:\n- Clear norms\n- Regular check-ins between managers and their direct reports to discuss workload, blockers, priorities for the coming sprint, and longer-term goals every week',
    );
    expect(blocks.map((b) => b.kind)).toEqual([
      'verbatim',
      'verbatim',
      'prose',
    ]);
    expect(blocks[2].prefix).toBe('- ');
  });

  it('keeps figure and table captions as written', () => {
    const blocks = segmentDocument(
      'Figure 1. Mean anxiety scores by group and time point across both waves.\n\nTable 2: Regression coefficients for daily screen time and sleep quality.\n\nScores rose in both groups over the school year, with the steepest change among the heaviest users.',
    );
    expect(blocks.map((b) => b.kind)).toEqual([
      'verbatim',
      'verbatim',
      'prose',
    ]);
  });

  it('joins hard-wrapped lines into one paragraph', () => {
    const blocks = segmentDocument(
      'Remote work has changed how teams operate across\nmany industries, and managers now evaluate output\nrather than hours spent at a desk.\n\nSecond paragraph with enough words in it to count.',
    );
    expect(blocks[0].text).toBe(
      'Remote work has changed how teams operate across many industries, and managers now evaluate output rather than hours spent at a desk.',
    );
  });
});

describe('paper structure', () => {
  it('never treats statistics with < and > as HTML', () => {
    const text =
      'Productivity rose (r = .34, p < .001). Outliers (> 3 SD from the mean) were winsorized.';
    expect(stripHtml(text)).toBe(text);
    expect(stripHtml('<p>Plain <strong>bold</strong> text</p><br/>')).toBe(
      'Plain bold text',
    );
    expect(
      segmentDocument(
        `Abstract\n\nScores rose (p < .001) in every group we studied this year.\n\nMethods\n\nOutliers (> 3 SD) were removed before any of the analyses were run.`,
      ).map((b) => b.text),
    ).toEqual([
      'Abstract',
      'Scores rose (p < .001) in every group we studied this year.',
      'Methods',
      'Outliers (> 3 SD) were removed before any of the analyses were run.',
    ]);
  });

  it('keeps title blocks and tables as written', () => {
    const blocks = segmentDocument(
      'The Effects of Remote Work on Productivity\nAuthor Name\nInstitutional Affiliation\n\n| Group | n | M |\n|---|---|---|\n| Remote | 176 | 3.61 |\n\nHybrid workers reported higher productivity than fully remote workers did.',
    );
    expect(blocks.map((b) => b.kind)).toEqual([
      'verbatim',
      'verbatim',
      'prose',
    ]);
    expect(blocks[1].text.split('\n')).toHaveLength(3);
  });

  it('keeps run-in headings and list labels outside the rewrite', () => {
    const [a, b] = segmentDocument(
      'Research Gaps. Most existing studies rely on single-company samples or pre-pandemic data.\n\n- Productivity: The Individual Work Performance Questionnaire includes 8 items rated on a 5-point Likert scale from strongly disagree to strongly agree.',
    );
    expect(a.prefix).toBe('Research Gaps. ');
    expect(a.text.startsWith('Most existing')).toBe(true);
    expect(b.prefix).toBe('- Productivity: ');
  });

  it('removes invisible characters chatbots leave behind', () => {
    const [block] = segmentDocument(
      'Well\u2011being rose after the\u202Fswitch to hybrid work for most of the staff.',
    );
    expect(block.text).toBe(
      'Well-being rose after the switch to hybrid work for most of the staff.',
    );
  });

  it('finds the terms a document repeats', () => {
    const terms = extractKeyTerms([
      'Remote work changed productivity and well-being for employees.',
      'Remote work and hybrid work both affect productivity and well-being.',
      'Under remote work, productivity and well-being moved together.',
    ]);
    expect(terms).toEqual(
      expect.arrayContaining(['remote work', 'productivity', 'well-being']),
    );
  });
});

describe('extractInvariants', () => {
  it('captures citations and numbers without repeating years inside citations', () => {
    const inv = extractInvariants(
      'A 2019 study of 3 hours per day found a 58% rise (Riehm et al., 2019) [4].',
    );
    expect(inv).toEqual(
      expect.arrayContaining([
        '(Riehm et al., 2019)',
        '[4]',
        '2019',
        '3',
        '58%',
      ]),
    );
    expect(inv.filter((t) => t === '2019')).toHaveLength(1);
  });

  it('protects APA statistics written without a leading zero', () => {
    const inv = extractInvariants(
      'The effect was small, r = .21, p < .05, n = 1,204.',
    );
    expect(inv).toEqual(
      expect.arrayContaining(['r = .21', 'p < .05', 'n = 1,204']),
    );
    expect(
      checkRewrite(
        'The effect was small, r = .21, p < .05.',
        'The effect was small (r = .21) and significant at p < .01.',
        'medium',
      ).missing,
    ).toEqual(['p < .05']);
  });

  it('requires statistical notation and percentages, not spelled-out versions', () => {
    const original = 'The sample was 58 % female (SD = 9.4).';
    expect(
      checkRewrite(
        original,
        'Of the sample, 58 percent were female, with a standard deviation of 9.4.',
        'medium',
      ).missing,
    ).toEqual(['SD = 9.4', '58%']);
    expect(
      checkRewrite(
        original,
        'Women made up 58% of the sample (SD=9.4).',
        'medium',
      ).missing,
    ).toEqual([]);
  });

  it('ignores lowercase parentheticals that merely mention a year', () => {
    expect(
      extractInvariants('Rates rose (in 2019, the rate doubled).'),
    ).toEqual(['2019']);
  });
});

describe('checkRewrite', () => {
  const original =
    'Teens who spent more than 3 hours per day faced double the risk (Riehm et al., 2019).';

  it('rejects rewrites that drop citations or change numbers', () => {
    const r = checkRewrite(
      original,
      'Teens online for over three hours daily, according to Riehm and colleagues, faced twice the risk.',
      'medium',
    );
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual(
      expect.arrayContaining(['(Riehm et al., 2019)', '3']),
    );
  });

  it('accepts a faithful rewrite', () => {
    const r = checkRewrite(
      original,
      'Spending more than 3 hours a day on social media doubled the risk for teens (Riehm et al., 2019).',
      'medium',
    );
    expect(r.problems).toEqual([]);
  });

  it('accepts a narrative citation that keeps authors and year', () => {
    const r = checkRewrite(
      'Remote work does not reduce performance (Bloom et al., 2015).',
      'As Bloom et al. (2015) found, remote work does not reduce performance.',
      'medium',
    );
    expect(r.missing).toEqual([]);
  });

  it('flags dropped precise terms and frequency inflation', () => {
    const r = checkRewrite(
      'Isolation can elevate stress, and self-reported productivity was moderate in this cross-sectional sample.',
      'Isolation often raises stress, and productivity was middling in this sample.',
      'medium',
    );
    expect(r.soft.join(' ')).toMatch(/more certain.*often/);
    const terms = checkRewrite(
      'Self-reported productivity was moderate in this cross-sectional sample of remote staff.',
      'Productivity was middling in this sample of remote staff.',
      'medium',
    ).soft.join(' ');
    expect(terms).toMatch(/self-reported/);
    expect(terms).toMatch(/cross-sectional/);
  });

  it('flags a cited claim that lost its hedge', () => {
    const r = checkRewrite(
      'Conversely, Wang et al. (2021) reported that prolonged remote work can erode productivity due to distractions at home. The inconsistency may stem from differences in job type.',
      'In contrast, Wang et al. (2021) observed that extended remote work reduced productivity because of home distractions. These divergent findings likely reflect differences in job type.',
      'medium',
    );
    expect(r.soft.join(' ')).toMatch(/Wang \(2021\) lost its hedge/);
    const fine = checkRewrite(
      'Remote work can erode productivity (Wang et al., 2021).',
      'Productivity can suffer under prolonged remote work (Wang et al., 2021).',
      'medium',
    );
    expect(fine.soft).toEqual([]);
  });

  it('keeps ordinal openers that number an argument', () => {
    const original =
      'First, tuition-free college would reduce economic inequality by opening degrees to students from low-income families.';
    expect(
      checkRewrite(
        original,
        'Free college would cut inequality by opening degrees to students from low-income families.',
        'medium',
      ).soft.join(' '),
    ).toMatch(/start with "First"/);
    expect(
      checkRewrite(
        original,
        'First, tuition-free college would cut inequality by opening degrees to students from low-income families.',
        'medium',
      ).soft,
    ).toEqual([]);
  });

  it('flags a recommendation that became more forceful', () => {
    const r = checkRewrite(
      'Organizations should consider hybrid models as a default rather than an exception.',
      'Organizations ought to adopt hybrid models as the standard rather than the exception.',
      'medium',
    );
    expect(r.soft.join(' ')).toMatch(/more forceful/);
  });

  it('flags claims that became more certain', () => {
    const r = checkRewrite(
      'Organizations should consider hybrid models, which may improve well-being and could raise output.',
      'Organizations must adopt hybrid models, which improve well-being and raise output.',
      'medium',
    );
    expect(r.hard).toEqual([]);
    expect(r.soft.join(' ')).toMatch(/more certain.*must/);
  });

  it('flags leftover machine-sounding phrases', () => {
    expect(
      findTells(
        'Furthermore, social media plays a crucial role in the digital landscape.',
      ),
    ).toEqual(
      expect.arrayContaining([
        'furthermore',
        'plays a crucial role',
        'digital landscape',
      ]),
    );
    expect(
      findTells('Children in foster care need stable placements.'),
    ).toEqual([]);
  });
});

describe('output cleanup', () => {
  it('strips preambles, tags, and wrapping quotes', () => {
    expect(
      cleanModelOutput(
        'Here is the rewritten paragraph:\n\n"<paragraph>Plain text.</paragraph>"',
        'Plain text.',
      ),
    ).toBe('Plain text.');
  });

  it('keeps the space before APA decimals', () => {
    expect(
      normalizeTypography(
        'The link was weak (r = .34, p < .001) , as expected .',
        'x',
      ),
    ).toBe('The link was weak (r = .34, p < .001), as expected.');
  });

  it('normalises model typography the original did not use', () => {
    expect(
      normalizeTypography(
        'Teens\u2014especially girls\u2014feel \u201Cleft out\u201D and self\u2011doubt.',
        'plain "quotes"',
      ),
    ).toBe('Teens, especially girls, feel "left out" and self-doubt.');
  });

  it('deletes empty sentence openers a model left in', () => {
    expect(
      polish(
        "In today's fast-paced world, companies use digital tools. Moreover, surveys show 58% work from home. Overall, the shift is lasting.",
        'x',
        'natural',
      ),
    ).toBe(
      'Companies use digital tools. Surveys show 58% work from home. The shift is lasting.',
    );
    expect(
      polish('The overall effect, moreover, was small.', 'x', 'natural'),
    ).toBe('The overall effect, moreover, was small.');
  });

  it('expands contractions without touching possessives', () => {
    expect(
      expandContractions(
        "It's clear that teens don't sleep, and the study's authors can't say why.",
      ),
    ).toBe(
      "It is clear that teens do not sleep, and the study's authors cannot say why.",
    );
  });
});

describe('humanizeDocument', () => {
  it('rewrites body paragraphs and leaves the title and references untouched', async () => {
    const complete: CompleteFn = (_s, user) =>
      Promise.resolve(paragraphOf(user));
    const result = await humanizeDocument(PAPER, settings, complete);
    expect(result.total).toBe(2);
    expect(result.text.split('\n\n')[0]).toBe(
      'The Impact of Social Media on Adolescent Mental Health',
    );
    expect(result.text).toContain('References\nRiehm, K. E., et al. (2019).');
  });

  it('retries with feedback when a citation is lost, then keeps the original if it is still lost', async () => {
    const prompts: string[] = [];
    const complete: CompleteFn = (_s, user) => {
      prompts.push(user);
      return Promise.resolve(
        'Teens online for long periods faced a higher risk of poor mental health outcomes, studies suggest.',
      );
    };
    const result = await humanizeDocument(PAPER, settings, complete, {
      concurrency: 1,
    });
    expect(
      prompts.some(
        (p) =>
          p.includes('Your previous attempt was rejected') &&
          p.includes('(Twenge et al., 2018)'),
      ),
    ).toBe(true);
    expect(result.kept).toBe(2);
    expect(result.text).toContain('(Riehm et al., 2019)');
  });

  it('detects papers and keeps an academic register when the tone is left on Natural', async () => {
    expect(looksAcademic(segmentDocument(PAPER))).toBe(true);
    expect(
      looksAcademic(
        segmentDocument(
          'We tried three coffee shops this weekend and liked the second one best because the staff were friendly.',
        ),
      ),
    ).toBe(false);
    const systems: string[] = [];
    const complete: CompleteFn = (system, user) => {
      systems.push(system);
      return Promise.resolve(paragraphOf(user));
    };
    const result = await humanizeDocument(
      PAPER,
      { ...settings, tone: 'natural' },
      complete,
    );
    expect(result.academicStyle).toBe(true);
    expect(systems.every((sys) => sys.includes('Academic register'))).toBe(
      true,
    );
  });

  it('gives methods and results paragraphs a light edit automatically', async () => {
    const systems: string[] = [];
    const complete: CompleteFn = (system, user) => {
      systems.push(system);
      return Promise.resolve(paragraphOf(user));
    };
    await humanizeDocument(
      'Introduction\n\nRemote work spread quickly during the pandemic and changed how firms operate.\n\nMethods\n\nWe surveyed 312 employees online between June and August 2024 using two scales.',
      settings,
      complete,
      { concurrency: 1 },
    );
    expect(systems[0]).toContain('REWRITE.');
    expect(systems[1]).toContain('LIGHT EDIT.');
  });

  it('stops retrying and starting paragraphs once the time budget is spent', async () => {
    let calls = 0;
    const complete: CompleteFn = async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 30));
      return 'Teens online for long periods faced a higher risk, studies suggest.';
    };
    const result = await humanizeDocument(PAPER, settings, complete, {
      concurrency: 1,
      deadline: Date.now() + 10,
    });
    expect(calls).toBe(1);
    expect(result.rewritten).toBe(0);
    expect(result.kept).toBe(2);
    expect(result.text).toContain('(Twenge et al., 2018)');
    expect(result.text).toContain('(Riehm et al., 2019)');
  });

  it('throws when every provider call fails so the user is not charged for an unchanged text', async () => {
    const complete: CompleteFn = () => Promise.reject(new Error('429'));
    await expect(
      humanizeDocument(PAPER, settings, complete),
    ).rejects.toBeInstanceOf(HumanizerUnavailableError);
  });
});
