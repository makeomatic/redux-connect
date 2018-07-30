import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router';
import { renderRoutes } from 'react-router-config';
import { loadAsyncConnect } from '../helpers/utils';
import { getMutableState } from '../helpers/state';

export class AsyncConnect extends Component {
  static propTypes = {
    render: PropTypes.func,
    beginGlobalLoad: PropTypes.func.isRequired,
    endGlobalLoad: PropTypes.func.isRequired,
    reloadOnPropsChange: PropTypes.func,
    /* eslint-disable react/forbid-prop-types, react/no-unused-prop-types */
    routes: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    helpers: PropTypes.any,
    /* eslint-enable */
  };

  static contextTypes = {
    store: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    helpers: {},
    reloadOnPropsChange() {
      return true;
    },
    render({ routes }) {
      return renderRoutes(routes);
    },
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      previousLocation: this.isLoaded() ? null : props.location,
    };

    this.mounted = false;
    this.loadDataCounter = 0;
  }

  componentDidMount() {
    this.mounted = true;
    const dataLoaded = this.isLoaded();

    // we dont need it if we already made it on server-side
    if (!dataLoaded) {
      this.loadAsyncData(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { location, reloadOnPropsChange } = this.props;
    const navigated = location !== nextProps.location;

    // Allow a user supplied function to determine if an async reload is necessary
    if (navigated && reloadOnPropsChange(this.props, nextProps)) {
      this.loadAsyncData(nextProps);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  isLoaded() {
    const { store } = this.context;
    return getMutableState(store.getState()).reduxAsyncConnect.loaded;
  }

  loadAsyncData(props) {
    const { store } = this.context;
    const { location, beginGlobalLoad, endGlobalLoad } = this.props;
    const loadResult = loadAsyncConnect({ ...props, store });

    this.setState({ previousLocation: location });

    // TODO: think of a better solution to a problem?
    this.loadDataCounter += 1;
    beginGlobalLoad();
    return (loadDataCounterOriginal => loadResult.then(() => {
      // We need to change propsToShow only if loadAsyncData that called this promise
      // is the last invocation of loadAsyncData method. Otherwise we can face a situation
      // when user is changing route several times and we finally show him route that has
      // loaded props last time and not the last called route
      if (this.loadDataCounter === loadDataCounterOriginal && this.mounted !== false) {
        this.setState({ previousLocation: null });
      }

      // TODO: investigate race conditions
      // do we need to call this if it's not last invocation?
      endGlobalLoad();
    }))(this.loadDataCounter);
  }

  render() {
    const { previousLocation } = this.state;
    const { location, render } = this.props;

    return (
      <Route
        location={previousLocation || location}
        render={() => render(this.props)}
      />
    );
  }
}

export default AsyncConnect;
