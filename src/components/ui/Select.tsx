import React from 'react';

interface ISelectOption {
  value: string;
  label: string;
}

export interface ISelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: ISelectOption[];
  testId?: string;
}

const Select: React.FC<ISelectProps> = (props): React.JSX.Element => {
  const { label, error, options, testId, className, children, id, ...selectProps } = props;
  const selectId = id || testId || selectProps.name || 'select';
  const chevronSvg =
    'data:image/svg+xml;utf8,' +
    '<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20' +
    'stroke=%22%236b7280%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22>' +
    '<polyline%20points=%226%209%2012%2015%2018%209%22></polyline></svg>';
  const wrapperStyles =
    'tw:border tw:border-[var(--color-border)] tw:rounded-lg tw:bg-[var(--color-surface)] ' + 'tw:transition-colors';
  const wrapperErrorStyles = error ? 'tw:border-[var(--color-danger)]' : '';
  const finalWrapperStyles = `${wrapperStyles} ${wrapperErrorStyles}`.trim();

  const selectBaseStyles =
    'tw:w-full tw:h-11 tw:px-4 tw:pb-2 tw:bg-transparent ' +
    'tw:border-0 tw:outline-none tw:text-base ' +
    'tw:transition-colors tw:focus:outline-none tw:focus:ring-2 ' +
    'tw:focus:ring-[var(--color-primary)]/30 ' +
    'tw:appearance-none ' +
    `tw:bg-[image:url('${chevronSvg}')] ` +
    'tw:bg-no-repeat tw:bg-right tw:pr-10';
  const selectLabelPadding = label ? '' : 'tw:pt-2';
  const finalSelectStyles = `${selectBaseStyles} ${selectLabelPadding} ${className || ''}`.trim();

  return (
    <div className="tw:w-full">
      <div className={finalWrapperStyles}>
        {label && (
          <label
            htmlFor={selectId}
            className="tw:block tw:px-4 tw:pt-2 tw:text-sm tw:font-medium tw:text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}
        <select id={selectId} className={finalSelectStyles} data-test-id={testId} {...selectProps}>
          {children}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="tw:mt-1 tw:text-sm tw:text-[var(--color-danger)]">{error}</p>}
    </div>
  );
};

export default Select;
