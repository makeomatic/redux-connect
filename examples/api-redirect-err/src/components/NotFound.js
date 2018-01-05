import React, { Component } from 'react';

export default class NotFound extends Component {
  componentWillMount() {
    const { staticContext } = this.props;

    if (staticContext) {
      staticContext.code = 404;
    }
  }
  render() {
    return (
      <div>
        {'Page not found'}
      </div>
    );
  }
}
