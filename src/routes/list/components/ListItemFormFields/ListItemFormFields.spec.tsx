import React from 'react';
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { EListType } from 'typings';

import ListItemFormFields, { type IListItemFormFieldsProps } from './index';

interface ISetupReturn {
  container: HTMLElement;
  input: HTMLElement;
  props: IListItemFormFieldsProps;
  user: UserEvent;
}

async function setup(listType: EListType, inputLabel: string): Promise<ISetupReturn> {
  const user = userEvent.setup();
  const props = {
    setFormData: jest.fn(),
    listType,
    formData: {
      product: '',
      task: '',
      content: '',
      quantity: '',
      author: '',
      title: '',
      artist: '',
      album: '',
      assigneeId: '',
      dueBy: '2020-05-21',
      numberInSeries: 0,
      category: '',
      read: false,
      purchased: false,
      completed: false,
    },
  };
  const { container, findByLabelText } = render(<ListItemFormFields {...props} />);
  const input = await findByLabelText(inputLabel);

  return { container, input, props, user };
}

describe('ListItemFormFields', () => {
  it('render Book fields when listType is BookList and calls setFormData when input is changed', async () => {
    const { container, input, props, user } = await setup(EListType.BOOK_LIST, 'Author');

    expect(container).toMatchSnapshot();
    expect(input).toBeVisible();

    await user.type(input, 'a');

    expect(props.setFormData).toHaveBeenCalled();
  });

  it('render Grocery fields when listType is GroceryList and calls setFormData when input is changed', async () => {
    const { container, input, props, user } = await setup(EListType.GROCERY_LIST, 'Product');

    expect(container).toMatchSnapshot();
    expect(input).toBeVisible();

    await user.type(input, 'a');

    expect(props.setFormData).toHaveBeenCalled();
  });

  it('render Music fields when listType is MusicList and calls setFormData when input is changed', async () => {
    const { container, input, props, user } = await setup(EListType.MUSIC_LIST, 'Album');

    expect(container).toMatchSnapshot();
    expect(input).toBeVisible();

    await user.type(input, 'a');

    expect(props.setFormData).toHaveBeenCalled();
  });

  it('render ToDo fields when listType is ToDoList and calls setFormData when input is changed', async () => {
    const { container, input, props, user } = await setup(EListType.TO_DO_LIST, 'Task');

    expect(container).toMatchSnapshot();
    expect(input).toBeVisible();

    await user.type(input, 'a');

    expect(props.setFormData).toHaveBeenCalled();
  });

  it('sets value for numberInSeries as a number when input', async () => {
    const { input, props, user } = await setup(EListType.BOOK_LIST, 'Number in series');

    await user.type(input, '2');

    expect(props.setFormData).toHaveBeenCalled();
  });
});
