import Promise from 'bluebird';
import { asyncConnect } from '../../../../';
import WrappedChild from '../components/WrappedChild';

export default asyncConnect([{
  key: 'beverage',
  promise: ({ helpers }) => Promise.delay(500, helpers.drink()),
}])(WrappedChild);
