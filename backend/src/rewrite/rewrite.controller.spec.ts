import { PATH_METADATA } from '@nestjs/common/constants';
import { RewriteController } from './rewrite.controller';

describe('RewriteController public routes', () => {
  it('does not expose stored manuscripts or cross-user project data', () => {
    const prototype = RewriteController.prototype;
    const routes = Object.getOwnPropertyNames(prototype)
      .filter((name) => name !== 'constructor')
      .map((name) => Reflect.getMetadata(PATH_METADATA, prototype[name]))
      .filter((path): path is string => typeof path === 'string');

    expect(routes).not.toContain('history');
    expect(routes).not.toContain('projects');
    expect(routes).not.toContain('semantic-search');
    expect(routes).not.toContain('semantic-map');
    expect(routes).not.toContain('style-drift');
    expect(routes).not.toContain('versions/:manuscriptId');
    expect(routes).not.toContain('log-feedback');
  });
});
