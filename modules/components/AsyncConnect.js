import React, { PropTypes, Component } from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import { loadAsyncConnect } from '../helpers/utils';

export default class AsyncConnect extends Component {
  static propTypes = {
    components: PropTypes.array.isRequired,
    params: PropTypes.object.isRequired,
    render: PropTypes.func.isRequired,
    beginGlobalLoad: PropTypes.func.isRequired,
    endGlobalLoad: PropTypes.func.isRequired,
    helpers: PropTypes.any,
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  static defaultProps = {
    render(props) {
      return <RouterContext {...props} />;
    },
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      propsToShow: this.isLoaded() ? props : null,
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
    this.loadAsyncData(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.propsToShow !== nextState.propsToShow;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  isLoaded() {
    const componentKeys = this.props.components.reduce((componentsMemo, component) => {
      if (component && component.reduxAsyncConnect && component.reduxAsyncConnect.length) {
        const asyncConnectComponentsWithKeys = component.reduxAsyncConnect
          .filter(asyncConnectComponent => !!asyncConnectComponent.key)
          .map(asyncConnectComponent => asyncConnectComponent.key);

        return [...componentsMemo, ...asyncConnectComponentsWithKeys];
      }

      return componentsMemo;
    }, []);

    const loadState = this.context.store.getState().reduxAsyncConnect.loadState;
    const reduxAsyncConnectComponentsLoaded = componentKeys.reduce((loadedMemo, key) => (
      loadState[key] ? (loadedMemo && loadState[key].loaded) : false
    ), true);

    return this.context.store.getState().reduxAsyncConnect.loaded &&
      reduxAsyncConnectComponentsLoaded;
  }

  loadAsyncData(props) {
    const store = this.context.store;
    const loadResult = loadAsyncConnect({ ...props, store });

    // TODO: think of a better solution to a problem?
    this.loadDataCounter++;
    this.props.beginGlobalLoad();
    return (loadDataCounterOriginal => loadResult.then(() => {
      // We need to change propsToShow only if loadAsyncData that called this promise
      // is the last invocation of loadAsyncData method. Otherwise we can face a situation
      // when user is changing route several times and we finally show him route that has
      // loaded props last time and not the last called route
      if (this.loadDataCounter === loadDataCounterOriginal && this.mounted !== false) {
        this.setState({ propsToShow: props });
      }

      // TODO: investigate race conditions
      // do we need to call this if it's not last invocation?
      this.props.endGlobalLoad();
    }))(this.loadDataCounter);
  }

  render() {
    const { propsToShow } = this.state;
    return propsToShow && this.props.render(propsToShow);
  }
}
