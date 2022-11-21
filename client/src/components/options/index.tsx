import React, { PropsWithChildren } from "react";

interface IProps extends PropsWithChildren {}

const Options: React.FC<IProps> = ({ children }) => {
  return (
    <div>
      options
      {children}
    </div>
  );
};

export default Options;
