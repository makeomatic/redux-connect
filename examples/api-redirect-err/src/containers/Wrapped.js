import { connect } from 'react-redux';
import { compose } from 'redux';
import { fetchData } from '../store/reducers/lunch';
import { asyncConnect } from '../../../../';
import Wrapped from '../components/Wrapped';

const $asyncConnect = asyncConnect([{
  // no `key` property, promise just fills store and then we get the value with classic `connect`
  promise: ({ store, helpers }) => {
    const { data, loaded } = store.getState().lunch;

    if (loaded) {
      return Promise.resolve(data);
    }

    return store.dispatch(fetchData(helpers.http));
  },
}]);

const $connect = connect(state => state.lunch.data);

export default compose($asyncConnect, $connect)(Wrapped);

