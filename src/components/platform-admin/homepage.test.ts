import jwt from 'jsonwebtoken';

import {IResponse} from '../../lib/router';

import {createTestContext} from '../app/app.test-helpers';
import {IContext} from '../app/context';
import {CLOUD_CONTROLLER_ADMIN} from '../auth/has-role';

import {
  Token,
} from '../auth';

import { viewHomepage } from './homepage';

const tokenKey = 'secret';

describe('homepage', () => {
  describe('when not a platform admin', () => {

    const time = Math.floor(Date.now() / 1000);
    const rawToken = {
      user_id: 'uaa-id-253',
      scope: [],
      exp: (time + (24 * 60 * 60)),
      origin: 'uaa',
    };
    const accessToken = jwt.sign(rawToken, tokenKey);

    const token = new Token(accessToken, [tokenKey]);
    const ctx: IContext = createTestContext({ token });

    it('should return an error', async () => {
      await expect(
        viewHomepage(ctx, {}),
      ).rejects.toThrow(/Not a platform admin/);
    });
  });

  describe('when a platform admin', () => {

    const time = Math.floor(Date.now() / 1000);
    const rawToken = {
      user_id: 'uaa-id-253',
      scope: [CLOUD_CONTROLLER_ADMIN],
      exp: (time + (24 * 60 * 60)),
      origin: 'uaa',
    };
    const accessToken = jwt.sign(rawToken, tokenKey);

    const token = new Token(accessToken, [tokenKey]);
    const ctx: IContext = createTestContext({ token });

    let response: IResponse;

    beforeEach(async () => {
      response = await viewHomepage(ctx, {});
    });

    it('should show the homepage with useful headings', async () => {
      expect(response.body).toMatch(/Platform Admin/);
      expect(response.body).toMatch(/Costs/);
      expect(response.body).toMatch(/Organisation management/);
      expect(response.body).toMatch(/User management/);
    });

    it('should show a link to the org report', async () => {
      expect(response.body).toMatch(/Organisation management/);
      expect(response.body).toMatch(/View trial and billable organisations/);
    });

    it('should show a form to lookup a user', async () => {
      expect(response.body).toMatch(/User management/);
      expect(response.body).toMatch(/Find a user/);
      expect(response.body).toMatch(/<button[^<]*Find user\s+<\/button>/m);
    });

    it('should show a form to show costs', async () => {
      expect(response.body).toMatch(/Costs/);
      expect(response.body).toMatch(/View costs for a month/);
      expect(response.body).toMatch(/January/);
      expect(response.body).toMatch(/December/);
      expect(response.body).toMatch(/Overall costs/);
      expect(response.body).toMatch(/Costs by service/);
      expect(response.body).toMatch(/Spend for PMO team/);
      expect(response.body).toMatch(/Sankey/);
    });
  });
});
