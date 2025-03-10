import { FC, HTMLProps, ReactNode } from 'react';
import PropTypes from 'prop-types';

interface IContentWrapperProps extends HTMLProps<HTMLDivElement> {
  children?: ReactNode;
  title?: string;
}

const ContentWrapper: FC<IContentWrapperProps> = ({ children, title = '' }) => {
  return (
    <>
        <title>{title}</title>
      {children}
    </>
  );
};

ContentWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string
};

export default ContentWrapper;
