import React, { type ChangeEventHandler, type ReactNode, useState, useRef, useEffect } from 'react';
import Input from '../ui/Input';
import { normalizeCategoryKey } from '../../utils/format';

export interface ICategoryFieldProps {
  handleInput: ChangeEventHandler;
  category?: string;
  categories?: string[];
  name?: string;
  child?: ReactNode;
  disabled?: boolean;
}

let instanceCounter = 0;

const getNextInstanceId = (): string => {
  instanceCounter += 1;
  return `${instanceCounter}`;
};

const CategoryField: React.FC<ICategoryFieldProps> = (props): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(props.category ?? '');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const instanceId = useRef<string>(getNextInstanceId());

  useEffect(() => {
    setInputValue(props.category ?? '');
    setHighlightedIndex(-1);
  }, [props.category]);

  const normalizedInput = normalizeCategoryKey(inputValue);
  const isExactMatch = (props.categories ?? []).some((category) => normalizeCategoryKey(category) === normalizedInput);

  const filteredCategories = (props.categories ?? []).filter((category) => {
    if (isExactMatch && normalizedInput) {
      return true;
    }
    return normalizeCategoryKey(category).includes(normalizedInput);
  });

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.currentTarget.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    props.handleInput(e);
  };

  const handleFocus = (): void => {
    setIsOpen(true);
  };

  const selectSuggestion = (suggestion: string): void => {
    setInputValue(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);

    const syntheticEvent = new Event('change', { bubbles: true });
    Object.defineProperty(syntheticEvent, 'target', {
      writable: false,
      value: {
        value: suggestion,
      },
    });

    props.handleInput(syntheticEvent as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (!isOpen) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredCategories.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectSuggestion(filteredCategories[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleBlur = (): void => {
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  return (
    <div className="tw:mb-3" data-test-id="category-field">
      <div className="tw:relative">
        <Input
          type="text"
          label="Category"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          name={props.name ?? 'category'}
          disabled={props.disabled ?? false}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`categories-${instanceId.current}`}
        />
        {isOpen && !props.disabled && filteredCategories.length > 0 && (
          <ul
            ref={listRef}
            id={`categories-${instanceId.current}`}
            className={`tw:absolute tw:left-0 tw:right-0 tw:top-full tw:mt-1 tw:bg-white
              tw:border tw:border-[var(--color-border)] tw:rounded-[var(--radius-lg)]
              tw:shadow-lg tw:max-h-60 tw:overflow-y-auto tw:z-10`}
            role="listbox"
            data-test-id="category-suggestions"
          >
            {filteredCategories.map((category, index) => (
              <li
                key={category}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`tw:px-4 tw:py-2 tw:cursor-pointer tw:transition-colors ${
                  index === highlightedIndex ? 'tw:bg-[var(--color-primary)]/10' : 'hover:tw:bg-gray-100'
                }`}
                onClick={() => selectSuggestion(category)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {category}
              </li>
            ))}
          </ul>
        )}
      </div>
      {props.child ?? ''}
    </div>
  );
};

export default CategoryField;
