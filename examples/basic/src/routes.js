import App from './App';
import Wrapped from './containers/Wrapped';
import WrappedChild from './containers/WrappedChild';
import Unwrapped from './components/Unwrapped';

export default [{
  component: App,
  routes: [{
    path: '/wrapped',
    component: Wrapped,
    routes: [{
      path: '/wrapped/child',
      component: WrappedChild,
    }],
  }, {
    path: '/unwrapped',
    component: Unwrapped,
  }],
}];