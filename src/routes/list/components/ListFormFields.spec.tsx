import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import ListFormFields, { type IListFormFieldsProps } from './ListFormFields';

async function setup(suppliedProps?: Partial<IListFormFieldsProps>): Promise<{
  props: IListFormFieldsProps;
  user: UserEvent;
}> {
  const user = userEvent.setup();
  const defaultProps: IListFormFieldsProps = {
    name: 'Test List',
    completed: false,
    refreshed: false,
    handleNameChange: jest.fn(),
    handleCompletedChange: jest.fn(),
    handleRefreshedChange: jest.fn(),
    editForm: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  render(<ListFormFields {...props} />);
  return { props, user };
}

describe('ListFormFields', () => {
  describe('basic rendering', () => {
    it('renders name field with correct value', async () => {
      const { props } = await setup();
      const nameField = screen.getByLabelText('Name');

      expect(nameField).toBeInTheDocument();
      expect(nameField).toHaveValue(props.name);
    });

    it('does not render checkbox fields when editForm is false', async () => {
      await setup({ editForm: false });

      expect(screen.queryByLabelText('Completed')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Refreshed')).not.toBeInTheDocument();
    });

    it('renders checkbox fields when editForm is true', async () => {
      await setup({ editForm: true });

      const completedField = screen.getByLabelText('Completed');
      const refreshedField = screen.getByLabelText('Refreshed');

      expect(completedField).toBeInTheDocument();
      expect(refreshedField).toBeInTheDocument();
      expect(completedField).not.toBeChecked();
      expect(refreshedField).not.toBeChecked();
    });

    it('renders checkbox fields with correct values when editForm is true', async () => {
      await setup({
        editForm: true,
        completed: true,
        refreshed: true,
      });

      const completedField = screen.getByLabelText('Completed');
      const refreshedField = screen.getByLabelText('Refreshed');

      expect(completedField).toBeChecked();
      expect(refreshedField).toBeChecked();
    });
  });

  describe('user interactions', () => {
    it('calls handleNameChange when name field changes', async () => {
      const { props, user } = await setup();
      const nameField = screen.getByLabelText('Name');

      await user.type(nameField, 'a');

      expect(props.handleNameChange).toHaveBeenCalled();
    });

    it('calls handleCompletedChange when completed checkbox changes', async () => {
      const { props, user } = await setup({ editForm: true });
      const completedField = screen.getByLabelText('Completed');

      await user.click(completedField);

      expect(props.handleCompletedChange).toHaveBeenCalled();
    });

    it('calls handleRefreshedChange when refreshed checkbox changes', async () => {
      const { props, user } = await setup({ editForm: true });
      const refreshedField = screen.getByLabelText('Refreshed');

      await user.click(refreshedField);

      expect(props.handleRefreshedChange).toHaveBeenCalled();
    });
  });

  describe('optional handlers', () => {
    it('does not render completed checkbox when handleCompletedChange is not provided', async () => {
      await setup({
        editForm: true,
        handleCompletedChange: undefined,
      });

      expect(screen.queryByLabelText('Completed')).not.toBeInTheDocument();
    });

    it('does not render refreshed checkbox when handleRefreshedChange is not provided', async () => {
      await setup({
        editForm: true,
        handleRefreshedChange: undefined,
      });

      expect(screen.queryByLabelText('Refreshed')).not.toBeInTheDocument();
    });

    it('renders completed checkbox when handleCompletedChange is provided', async () => {
      const { user } = await setup({
        editForm: true,
        handleCompletedChange: jest.fn(),
      });
      const completedField = screen.getByLabelText('Completed');

      await user.click(completedField);
      expect(completedField).toBeInTheDocument();
    });

    it('renders refreshed checkbox when handleRefreshedChange is provided', async () => {
      const { user } = await setup({
        editForm: true,
        handleRefreshedChange: jest.fn(),
      });
      const refreshedField = screen.getByLabelText('Refreshed');

      await user.click(refreshedField);
      expect(refreshedField).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper labels for all form fields', async () => {
      await setup({ editForm: true });

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Completed')).toBeInTheDocument();
      expect(screen.getByLabelText('Refreshed')).toBeInTheDocument();
    });

    it('has proper placeholder for name field', async () => {
      await setup();
      const nameField = screen.getByLabelText('Name');

      expect(nameField).toHaveAttribute('placeholder', 'My super cool list');
    });
  });

  describe('snapshot tests', () => {
    it('matches snapshot for create form', async () => {
      const { container } = render(
        <ListFormFields
          name="Test List"
          completed={false}
          refreshed={false}
          handleNameChange={jest.fn()}
          editForm={false}
        />,
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for edit form', async () => {
      const { container } = render(
        <ListFormFields
          name="Test List"
          completed={true}
          refreshed={true}
          handleNameChange={jest.fn()}
          handleCompletedChange={jest.fn()}
          handleRefreshedChange={jest.fn()}
          editForm={true}
        />,
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
