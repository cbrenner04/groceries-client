import axios from 'utils/api';
import { showToast } from '../../utils/toast';

import * as utils from './utils';
import type { IListItemConfiguration } from 'typings';

const mockShowToast = showToast as Mocked<typeof showToast>;

const mockNavigate = vi.fn();

describe('Templates Utils', () => {
  describe('fetchTemplates', () => {
    it('returns templates when successful', async () => {
      const mockTemplates: IListItemConfiguration[] = [
        {
          id: 'id1',
          name: 'grocery list',
          user_id: 'id1',
          created_at: '',
          updated_at: '',
          archived_at: null,
        },
      ];
      axios.get = vi.fn().mockResolvedValue({ data: mockTemplates });

      const result = await utils.fetchTemplates({ navigate: mockNavigate });

      expect(axios.get).toHaveBeenCalledWith('/list_item_configurations');
      expect(result?.templates).toEqual(mockTemplates);
    });

    it('filters out archived templates', async () => {
      const mockTemplates = [
        {
          id: 'id1',
          name: 'active',
          user_id: 'id1',
          created_at: '',
          updated_at: '',
          archived_at: null,
        },
        {
          id: 'id2',
          name: 'archived',
          user_id: 'id1',
          created_at: '',
          updated_at: '',
          archived_at: '2024-01-01T00:00:00Z',
        },
      ];
      axios.get = vi.fn().mockResolvedValue({ data: mockTemplates });

      const result = await utils.fetchTemplates({ navigate: mockNavigate });

      expect(result?.templates).toHaveLength(1);
      expect(result?.templates[0].id).toBe('id1');
    });

    it('redirects to signin when 401', async () => {
      axios.get = vi.fn().mockRejectedValue({ response: { status: 401 } });

      await utils.fetchTemplates({ navigate: mockNavigate });

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('throws error for other statuses', async () => {
      axios.get = vi.fn().mockRejectedValue({ response: { status: 400 } });

      await expect(utils.fetchTemplates({ navigate: mockNavigate })).rejects.toThrow();
    });
  });

  describe('fetchTemplateToEdit', () => {
    it('returns template and fields when successful', async () => {
      const mockTemplate: IListItemConfiguration = {
        id: 'id1',
        name: 'grocery list',
        user_id: 'id1',
        created_at: '',
        updated_at: '',
        archived_at: null,
      };
      const mockFields = [
        {
          id: 'field1',
          label: 'product',
          data_type: 'free_text',
          position: 1,
          primary: true,
          archived_at: null,
          list_item_configuration_id: 'id1',
          created_at: '',
          updated_at: '',
        },
      ];
      axios.get = vi.fn().mockResolvedValueOnce({ data: mockTemplate }).mockResolvedValueOnce({ data: mockFields });

      const result = await utils.fetchTemplateToEdit({
        id: 'id1',
        navigate: mockNavigate,
      });

      expect(result?.template).toEqual(mockTemplate);
      expect(result?.fieldConfigurations).toEqual(mockFields);
    });

    it('redirects to signin when 401', async () => {
      axios.get = vi.fn().mockRejectedValue({ response: { status: 401 } });

      await utils.fetchTemplateToEdit({ id: 'id1', navigate: mockNavigate });

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to templates when 403', async () => {
      axios.get = vi.fn().mockRejectedValue({ response: { status: 403 } });

      await utils.fetchTemplateToEdit({ id: 'id1', navigate: mockNavigate });

      expect(mockShowToast.error).toHaveBeenCalledWith('Template not found');
      expect(mockNavigate).toHaveBeenCalledWith('/templates');
    });

    it('redirects to templates when 404', async () => {
      axios.get = vi.fn().mockRejectedValue({ response: { status: 404 } });

      await utils.fetchTemplateToEdit({ id: 'id1', navigate: mockNavigate });

      expect(mockShowToast.error).toHaveBeenCalledWith('Template not found');
      expect(mockNavigate).toHaveBeenCalledWith('/templates');
    });
  });

  describe('failure', () => {
    it('redirects to signin when 401', () => {
      const setPending = vi.fn();
      utils.failure({ response: { status: 401 } }, mockNavigate, setPending);

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to templates when 403', () => {
      const setPending = vi.fn();
      utils.failure({ response: { status: 403 } }, mockNavigate, setPending);

      expect(mockShowToast.error).toHaveBeenCalledWith('Template not found');
    });

    it('redirects to templates when 404', () => {
      const setPending = vi.fn();
      utils.failure({ response: { status: 404 } }, mockNavigate, setPending);

      expect(mockShowToast.error).toHaveBeenCalledWith('Template not found');
    });

    it('shows validation errors when 400', () => {
      const setPending = vi.fn();
      utils.failure({ response: { status: 400, data: { foo: 'bar', baz: 'qux' } } }, mockNavigate, setPending);

      expect(setPending).toHaveBeenCalledWith(false);
      expect(mockShowToast.error).toHaveBeenCalledWith('foo bar and baz qux');
    });

    it('shows generic error when no response', () => {
      const setPending = vi.fn();
      utils.failure({ request: 'error' }, mockNavigate, setPending);

      expect(setPending).toHaveBeenCalledWith(false);
      expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
    });

    it('shows error message when neither response nor request', () => {
      const setPending = vi.fn();
      utils.failure({ message: 'custom error' }, mockNavigate, setPending);

      expect(setPending).toHaveBeenCalledWith(false);
      expect(mockShowToast.error).toHaveBeenCalledWith('custom error');
    });
  });
});
