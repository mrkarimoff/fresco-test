import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from '~/lib/ui/components/Icon';

const SearchButton = ({ searchIsOpen = false, nodeIconName, onClick }) => {
  const searchBtnClasses = cx('search__search-button', {
    'search__search-button--hidden': searchIsOpen,
  });

  return (
    <Icon
      name={nodeIconName}
      onClick={() => onClick?.()}
      className={searchBtnClasses}
    />
  );
};

SearchButton.propTypes = {
  searchIsOpen: PropTypes.bool,
  nodeIconName: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default SearchButton;
