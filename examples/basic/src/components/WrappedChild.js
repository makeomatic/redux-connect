import React from 'react';

function WrappedChild({ beverage }) {
  return (
    <div>
      <h2>
        {'Wrapped child component'}
      </h2>
      <div>
        {`beverage: ${beverage}`}
      </div>
    </div>
  );
}

export default WrappedChild;
