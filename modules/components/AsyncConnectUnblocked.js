import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import RouterContext from 'react-router/lib/RouterContext';

import { loadAsyncConnect, eachComponents } from '../helpers/utils';
import { beginGlobalLoad, endGlobalLoad } from '../store';

class AsyncConnectUnblocked extends Component {
  static propTypes = {
    components: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
    beginGlobalLoad: PropTypes.func.isRequired,
    endGlobalLoad: PropTypes.func.isRequired,
    helpers: PropTypes.any,
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      propsToShow: this.isLoaded() ? props : null,
      currentId: null,
    };
  }

  componentDidMount() {
    const dataLoaded = this.isLoaded();

    // we dont need it if we already made it on server-side
    if (!dataLoaded) {
      this.loadAsyncData(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.loadAsyncData(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.propsToShow !== nextState.propsToShow
            && this.state.currentId !== nextState.currentId
    );
  }

  isLoaded() {
    return this.context.store.getState().reduxAsyncConnect.loaded;
  }

  loadAsyncData(props) {
    const blocked = [];
    const unblocked = [];

    // looking for 'async': true
    eachComponents(props.components, (component) => {
      if (component && component.reduxAsyncConnect) {
        if (Array.isArray(component.reduxAsyncConnect)) {
          if (component.reduxAsyncConnect.some((item) => item.async)) {
            unblocked.push(component);
          } else {
            blocked.push(component);
          }
        }
      }
    });

    this.startLoading({
      propsToLoad: props,
      blocked,
      unblocked,
    });
  }

  /**
   * This method will take current item from the current
   * and based on the 'type' value, will load blocked or unblocked
   * components. When while loading of the data, currentItem is changed
   * this method will throw error 'mismatch'
   */
  load(type) {
    const current = this.current;

    if (!current) {
      return Promise.resolve();
    }

    const store = this.context.store;

    const props = {
      ...current.propsToLoad,
      components: current[type] || [],
      store,
    };

    return loadAsyncConnect(props).then(() => {
      // compare whether it's still the same
      if (current.id !== this.current.id) {
        // it is already different one
        throw new Error('mismatch');
      }
    });
  }

  // We need to change propsToShow only if loadAsyncData that called this promise
  // is the last invocation of loadAsyncData method. Otherwise we can face situation
  // when user is changing route several times and we finally show him route that has
  // loaded props last time and not the last called route
  startLoading(props) {
    // 1. load blocked items
    // 2. render page
    // 3. load unblocked items
    // if when loading current get's changed, restart the process

    this.current = props;
    this.current.id = `${(new Date().getTime())}_${Math.random() * 1000}`;

    if (this.loading) {
      // we already running, so no need for the second run
      // previous run will pickup the new currentItem automatically
      return;
    }

    const run = () => (
      Promise.resolve()
        .then(() => this.load('blocked'))
        .then(() => (
          new Promise((resolve) => {
            this.setState({
              propsToShow: this.current.propsToLoad,
              currentId: this.current.id,
            }, resolve);
          })
        ))
        .then(() => this.load('unblocked'))
        .catch((e) => {
          if (e.message === 'mismatch') {
            // have to rerun whole thing again
            return run();
          }
          // unknown error, break
          throw e;
        })
    );

    this.loading = true;
    this.props.beginGlobalLoad();

    run()
      .then(() => {
        this.loading = false;
        this.props.endGlobalLoad();
      });
  }

  render() {
    const { propsToShow } = this.state;

    if (propsToShow) {
      return <RouterContext {...propsToShow} />;
    }

    return null;
  }
}

export default connect(null, { beginGlobalLoad, endGlobalLoad })(AsyncConnectUnblocked);
